import { getContext, setContext } from "svelte";
import type { VnasPosition } from "../aviation/resolvePosition.js";

/** Gives the page's positions when called. */
type PositionsGetter = () => readonly VnasPosition[];

const key = Symbol("@indy-center/centerline-svelte positions");

/** No layout set any: every lookup is unknown. */
const none: PositionsGetter = () => [];

/**
 * Gives every component below this one the page's positions, so `Position`
 * and `Frequency` can look themselves up from a callsign. Call it once, in
 * the root layout, with a function returning the positions the server
 * `load` gave: `setPositions(() => data.positions)`. A function, so the
 * lookups follow when the layout's data reloads.
 */
export function setPositions(positions: PositionsGetter): void {
  setContext(key, positions);
}

/**
 * The page's positions, as a layout set them with `setPositions`: a
 * function to call where they're read, such as in a `$derived`. It gives
 * no positions when no layout set them.
 */
export function getPositions(): PositionsGetter {
  return getContext<PositionsGetter | undefined>(key) ?? none;
}
