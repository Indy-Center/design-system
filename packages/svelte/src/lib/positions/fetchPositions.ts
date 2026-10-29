import type { VnasPosition } from "../aviation/resolvePosition.js";

/** The parts of a Data Admin facility the lookup reads. */
type DataAdminFacility = {
  name: string;
  positions: {
    id: string;
    callsign: string;
    name: string;
    radioName: string;
    frequency: number;
    starred: boolean;
  }[];
  childFacilities?: DataAdminFacility[];
};

/** The parts of Data Admin's ARTCC reply the lookup reads. */
type DataAdminArtcc = {
  lastUpdatedAt: string;
  facility: DataAdminFacility;
};

/** Every position in a facility and the facilities under it, slimmed. */
function slim(facility: DataAdminFacility): VnasPosition[] {
  return [
    ...facility.positions.map((p) => ({
      id: p.id,
      callsign: p.callsign,
      name: p.name,
      radioName: p.radioName.replace(/\s+/g, " ").trim(),
      frequency: p.frequency,
      facility: facility.name,
      starred: p.starred,
    })),
    ...(facility.childFacilities ?? []).flatMap(slim),
  ];
}

export type PositionsFetcherOptions = {
  /** The `fetch` to call Data Admin with. Defaults to the global one. */
  fetch?: typeof fetch;
  /** How long a copy is used before Data Admin is checked again, in ms. An hour by default. */
  maxAge?: number;
  /** The clock, in ms. `Date.now` by default. */
  now?: () => number;
};

/** What the fetcher holds for one ARTCC. */
type Entry = {
  /** Data Admin's, for the copy held; undefined while there is none. */
  lastUpdatedAt?: string;
  positions: VnasPosition[];
  /** Until when the copy is used without asking Data Admin again. */
  freshUntil: number;
};

/** How soon to ask again after Data Admin fails. */
const RETRY_AFTER = 60_000;

/**
 * Fetches an ARTCC's positions from vNAS Data Admin, slimmed, and keeps
 * them in memory. Callers at the same time share one request. After
 * `maxAge` it asks again, and takes the new positions only if Data Admin's
 * `lastUpdatedAt` changed.
 *
 * It never rejects: if Data Admin fails, it logs the error and gives the
 * copy it has, or no positions, and asks again after a minute.
 */
export function createPositionsFetcher({
  fetch = globalThis.fetch,
  maxAge = 60 * 60_000,
  now = Date.now,
}: PositionsFetcherOptions = {}) {
  const entries = new Map<string, Entry>();
  const inflight = new Map<string, Promise<VnasPosition[]>>();

  async function download(artcc: string): Promise<DataAdminArtcc> {
    const url = `https://data-api.vnas.vatsim.net/api/artccs/${encodeURIComponent(artcc)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`${url} answered ${response.status}`);
    }
    const data = (await response.json()) as DataAdminArtcc;
    if (typeof data?.lastUpdatedAt !== "string" || !data.facility) {
      throw new Error(`${url} didn't answer with an ARTCC`);
    }
    return data;
  }

  async function refresh(artcc: string): Promise<VnasPosition[]> {
    const old = entries.get(artcc);
    let entry: Entry;
    try {
      const data = await download(artcc);
      entry = {
        lastUpdatedAt: data.lastUpdatedAt,
        positions:
          old?.lastUpdatedAt === data.lastUpdatedAt
            ? old.positions
            : slim(data.facility),
        freshUntil: now() + maxAge,
      };
    } catch (error) {
      console.error(`Couldn't fetch ${artcc}'s positions from vNAS`, error);
      entry = {
        lastUpdatedAt: old?.lastUpdatedAt,
        positions: old?.positions ?? [],
        freshUntil: now() + Math.min(RETRY_AFTER, maxAge),
      };
    }
    entries.set(artcc, entry);
    return entry.positions;
  }

  return function fetchPositions(artcc: string): Promise<VnasPosition[]> {
    const entry = entries.get(artcc);
    if (entry && now() < entry.freshUntil) {
      return Promise.resolve(entry.positions);
    }
    let pending = inflight.get(artcc);
    if (!pending) {
      pending = refresh(artcc).finally(() => inflight.delete(artcc));
      inflight.set(artcc, pending);
    }
    return pending;
  };
}
