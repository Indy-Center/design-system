/**
 * A VATSIM rating, a controller's or a pilot's. (`Rating` is the component
 * that shows one.)
 */
export type RatingDetails = {
  /** VATSIM's number, which also orders them: `5`. */
  id: number;
  /** The short code: `"C1"`. */
  short: string;
  /** VATSIM's name: `"Enroute Controller"`. */
  long: string;
};

/**
 * VATSIM's controller ratings, as its data feed ships them, in order. Sort
 * by `id` to rank members.
 */
export const RATINGS: readonly RatingDetails[] = [
  { id: -1, short: "INAC", long: "Inactive" },
  { id: 0, short: "SUS", long: "Suspended" },
  { id: 1, short: "OBS", long: "Observer" },
  { id: 2, short: "S1", long: "Tower Trainee" },
  { id: 3, short: "S2", long: "Tower Controller" },
  { id: 4, short: "S3", long: "Senior Student" },
  { id: 5, short: "C1", long: "Enroute Controller" },
  { id: 6, short: "C2", long: "Controller 2 (not in use)" },
  { id: 7, short: "C3", long: "Senior Controller" },
  { id: 8, short: "I1", long: "Instructor" },
  { id: 9, short: "I2", long: "Instructor 2 (not in use)" },
  { id: 10, short: "I3", long: "Senior Instructor" },
  { id: 11, short: "SUP", long: "Supervisor" },
  { id: 12, short: "ADM", long: "Administrator" },
];

// How the vNAS feed spells them (`vatsimData.userRating`), by short code.
const VNAS_NAMES: Record<string, string> = {
  OBS: "Observer",
  S1: "Student1",
  S2: "Student2",
  S3: "Student3",
  C1: "Controller1",
  C2: "Controller2",
  C3: "Controller3",
  I1: "Instructor1",
  I2: "Instructor2",
  I3: "Instructor3",
  SUP: "Supervisor",
  ADM: "Administrator",
};

/**
 * The rating for any spelling a data source gives: VATSIM's or VATUSA's
 * number (`5`), the short code (`"C1"`), vNAS's name (`"Controller1"`) or
 * VATSIM's (`"Enroute Controller"`), in any case. Undefined when it is none.
 */
export function findRating(value: number | string): RatingDetails | undefined {
  return findIn(RATINGS, value, (r) => VNAS_NAMES[r.short]);
}

// The rating in `table` with `value` as its id, or as its short code, long
// name or `otherName`, in any case.
function findIn(
  table: readonly RatingDetails[],
  value: number | string,
  otherName: (r: RatingDetails) => string | undefined = () => undefined,
) {
  if (typeof value === "number") return table.find((r) => r.id === value);
  const wanted = value.toLowerCase();
  return table.find((r) =>
    [r.short, r.long, otherName(r)].some(
      (name) => name?.toLowerCase() === wanted,
    ),
  );
}

/**
 * VATSIM's pilot ratings, as its data feed ships them, in order. Each `id`
 * is a bit mask holding the ones below it, so they also sort by `id`.
 */
export const PILOT_RATINGS: readonly RatingDetails[] = [
  { id: 0, short: "NEW", long: "Basic Member" },
  { id: 1, short: "PPL", long: "Private Pilot License" },
  { id: 3, short: "IR", long: "Instrument Rating" },
  { id: 7, short: "CMEL", long: "Commercial Multi-Engine License" },
  { id: 15, short: "ATPL", long: "Airline Transport Pilot License" },
  { id: 31, short: "FI", long: "Flight Instructor" },
  { id: 63, short: "FE", long: "Flight Examiner" },
];

/**
 * The pilot rating for VATSIM's number (`3`), the short code (`"IR"`) or
 * VATSIM's name (`"Instrument Rating"`), in any case. Undefined when it is
 * none.
 */
export function findPilotRating(
  value: number | string,
): RatingDetails | undefined {
  return findIn(PILOT_RATINGS, value);
}
