import { parseCallsign } from "./callsign.js";

/**
 * A position from vNAS Data Admin, slimmed to what a page shows: about
 * 26 KB for ZID's 157, against Data Admin's 1 MB.
 */
export type VnasPosition = {
  /** Data Admin's id, which the vNAS feed gives as `primaryPositionId`. */
  id: string;
  /** The default callsign: `IND_83_CTR`. */
  callsign: string;
  /** The sector or position name: "Falmouth 83". */
  name: string;
  /** What pilots call it, spaces collapsed: "Indy Center". */
  radioName: string;
  /** In hertz: `128225000`. */
  frequency: number;
  /** The facility's name: "Indianapolis ARTCC". */
  facility: string;
  /** Starred in Data Admin. */
  starred: boolean;
};

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
 */
export function resolvePosition<
  P extends Pick<VnasPosition, "id" | "callsign">,
>(
  callsign: string,
  positions: readonly P[],
  { positionId }: ResolvePositionOptions = {},
): { match: PositionMatch; position: P } | undefined {
  if (positionId !== undefined) {
    const position = positions.find((p) => p.id === positionId);
    return position && { match: "id", position };
  }

  const find = (wanted: string) => positions.find((p) => p.callsign === wanted);

  const exact = find(callsign);
  if (exact) return { match: "exact", position: exact };

  const parts = parseCallsign(callsign);
  if (parts?.middle === undefined) return undefined;
  const { prefix, middle, type } = parts;

  const relief =
    (middle.length > 1 && /[0-9]$/.test(middle)
      ? find(`${prefix}_${middle.slice(0, -1)}_${type}`)
      : undefined) ??
    (/^[0-9]+$/.test(middle) ? find(`${prefix}_${type}`) : undefined);
  return relief && { match: "relief", position: relief };
}
