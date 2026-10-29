import { resolvePosition, type VnasPosition } from "./resolvePosition.js";

/** The logins `groupByPosition` found on one position. */
export type PositionGroup<
  L,
  P extends Pick<VnasPosition, "id" | "callsign"> = VnasPosition,
> = {
  /** The position's callsign, or the login's own when it is unknown. */
  callsign: string;
  /** The position the logins resolve to; undefined when unknown. */
  position: P | undefined;
  /** Who is on it, in the order given. */
  logins: L[];
};

/**
 * The feed's logins, one group per position they resolve to, so a relief
 * login (`IND_831_CTR`) joins the person on `IND_83_CTR`. Each login is
 * resolved as `resolvePosition` does, by its `positionId` when it has one.
 * A login that resolves to nothing is grouped by its own callsign. Groups
 * come in the order of their first login.
 */
export function groupByPosition<
  L extends { callsign: string; positionId?: string },
  P extends Pick<VnasPosition, "id" | "callsign">,
>(logins: readonly L[], positions: readonly P[]): PositionGroup<L, P>[] {
  const groups = new Map<string, PositionGroup<L, P>>();
  for (const login of logins) {
    const position = resolvePosition(login.callsign, positions, {
      positionId: login.positionId,
    })?.position;
    // Keyed apart, so an unknown callsign can't join a position.
    const key = position ? `id:${position.id}` : `callsign:${login.callsign}`;
    const group = groups.get(key);
    if (group) group.logins.push(login);
    else
      groups.set(key, {
        callsign: position?.callsign ?? login.callsign,
        position,
        logins: [login],
      });
  }
  return [...groups.values()];
}
