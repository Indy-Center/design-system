import { getContext, setContext } from "svelte";
import type { PositionInfo } from "../aviation/resolvePosition.js";

/** Gives the page's positions when called. */
type PositionsGetter<P extends PositionInfo = PositionInfo> =
  () => readonly P[];

const key = Symbol("@indy-center/centerline-svelte positions");

/** No layout set any: every lookup is unknown. */
const none = (): readonly never[] => [];

/**
 * Gives every component below this one the page's positions, so `Position`
 * and `Frequency` can look themselves up from a callsign. Call it once, in
 * the root layout, with a function returning the positions the server
 * `load` gave: `setPositions(() => data.positions)`. A function, so the
 * lookups follow when the layout's data reloads. The CMS catalogue's
 * positions go in as they are.
 */
export function setPositions<P extends PositionInfo>(
  positions: PositionsGetter<P>,
): void {
  setContext(key, positions);
}

/**
 * The page's positions, as a layout set them with `setPositions`: a
 * function to call where they're read, such as in a `$derived`. It gives
 * no positions when no layout set them. Name the type the layout set,
 * `getPositions<CataloguePosition>()`, to read their other fields; it isn't
 * checked.
 */
export function getPositions<
  P extends PositionInfo = PositionInfo,
>(): PositionsGetter<P> {
  return getContext<PositionsGetter<P> | undefined>(key) ?? none;
}
