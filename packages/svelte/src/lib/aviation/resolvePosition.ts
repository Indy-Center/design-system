import { parseCallsign } from "./callsign.js";

/**
 * What centerline reads of a position: the fields of the CMS catalogue's
 * positions that `Position`, `Frequency` and `resolvePosition` use. Pass
 * the catalogue's positions as they are; their other fields (`facility`,
 * `requiredCredentials`) are kept, not read.
 */
export type PositionInfo = {
  /** The vNAS id, which the vNAS feed gives as `primaryPositionId`. */
  id: string;
  /** The default callsign: `IND_83_CTR`. */
  callsign: string;
  /** The sector or position name: "Falmouth 83". */
  name: string;
  /** As controllers say it: `FLM 83`, `LEX LC`; null where there is none. */
  shortName: string | null;
  /** What pilots call it: "Indy Center". */
  radioName: string;
  /** In hertz: `128225000`. */
  frequency: number;
  /** vNAS no longer lists it. A callsign never resolves to it. */
  retired: boolean;
};

/** What `resolvePosition` reads: an id and callsign, and whether it's retired. */
export type MatchablePosition = Pick<PositionInfo, "id" | "callsign"> &
  Partial<Pick<PositionInfo, "retired">>;

/** How `resolvePosition` found the position. */
export type PositionMatch = "id" | "exact" | "relief";

export type ResolvePositionOptions = {
  /**
   * The vNAS position id of the person logged in, from the vNAS feed. When
   * given, it decides alone: the callsign isn't read.
   */
  positionId?: string;
};

/**
 * The position a controller's callsign is for, or undefined when none is.
 *
 * Online, pass the vNAS position id and it matches on that. Otherwise the
 * relief-login rule: the callsign exactly; else with one trailing digit
 * dropped from the middle part (`IND_831_CTR` is `IND_83_CTR`); else with an
 * all-digit middle part dropped (`IND_1_GND` is `IND_GND`). No rule lands on
 * a different one of ZID's positions.
 *
 * A retired position is found by its id only: no callsign resolves to a
 * position vNAS no longer lists.
 */
export function resolvePosition<P extends MatchablePosition>(
  callsign: string,
  positions: readonly P[],
  { positionId }: ResolvePositionOptions = {},
): { match: PositionMatch; position: P } | undefined {
  if (positionId !== undefined) {
    const position = positions.find((p) => p.id === positionId);
    return position && { match: "id", position };
  }

  const find = (wanted: string) =>
    positions.find((p) => p.callsign === wanted && !p.retired);

  const exact = find(callsign);
  if (exact) return { match: "exact", position: exact };

  const parts = parseCallsign(callsign);
  if (parts?.middle === undefined) return undefined;
  const { prefix, middle, type } = parts;

  // A trailing digit dropped from the middle: IND_831_CTR is IND_83_CTR.
  if (middle.length > 1 && /[0-9]$/.test(middle)) {
    const relief = find(`${prefix}_${middle.slice(0, -1)}_${type}`);
    if (relief) return { match: "relief", position: relief };
  }

  // An all-digit middle dropped: IND_1_GND is IND_GND.
  if (/^[0-9]+$/.test(middle)) {
    const relief = find(`${prefix}_${type}`);
    if (relief) return { match: "relief", position: relief };
  }

  return undefined;
}
