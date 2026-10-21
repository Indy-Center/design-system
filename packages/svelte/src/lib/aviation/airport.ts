/**
 * An airport, as `Position` (and `Airport`) take it: its ICAO code,
 * `"KLEX"`, and its name, `"Blue Grass"`, where the app has one.
 */
export type AirportInfo = {
  code: string;
  name?: string;
};
