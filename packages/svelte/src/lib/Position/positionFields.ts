/** The parts of a position that `Position` can show. */
export const POSITION_FIELDS = [
  "shortName",
  "airport",
  "radioName",
  "name",
  "frequency",
] as const;

/** A part of a position that `Position` can show. */
export type PositionField = (typeof POSITION_FIELDS)[number];
