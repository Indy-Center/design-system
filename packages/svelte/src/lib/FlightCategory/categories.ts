/** The flight categories, best weather first. */
export const FLIGHT_CATEGORIES = ["VFR", "MVFR", "IFR", "LIFR"] as const;

/** A flight category, as a METAR's ceiling and visibility give it. */
export type FlightCategoryCode = (typeof FLIGHT_CATEGORIES)[number];
