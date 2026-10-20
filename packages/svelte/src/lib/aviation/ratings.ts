/** A VATSIM controller rating. */
export type Rating = {
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
export const RATINGS: readonly Rating[] = [
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
export function findRating(value: number | string): Rating | undefined {
  if (typeof value === "number") return RATINGS.find((r) => r.id === value);
  const wanted = value.toLowerCase();
  return RATINGS.find((r) =>
    [r.short, r.long, VNAS_NAMES[r.short]].some(
      (name) => name?.toLowerCase() === wanted,
    ),
  );
}
