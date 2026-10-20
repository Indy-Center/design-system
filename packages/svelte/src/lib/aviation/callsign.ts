/** A controller's callsign in parts: `IND_83_CTR` is `IND`, `83`, `CTR`. */
export type CallsignParts = {
  /** The first part, often the facility: `IND`, `LEX`, `DAY`. */
  prefix: string;
  /** The part between, when there is one: `83`, `E`. */
  middle?: string;
  /** The last part, the position type: `CTR`, `GND`. */
  type: string;
};

const CALLSIGN = /^([A-Z0-9]+)(?:_([A-Z0-9]+))?_([A-Z0-9]+)$/;

/**
 * A controller's callsign split into its parts, or undefined when the text
 * isn't one (a pilot's `AAL123`). Callsigns are upper case: pass them as
 * the network writes them.
 */
export function parseCallsign(callsign: string): CallsignParts | undefined {
  const match = CALLSIGN.exec(callsign);
  if (!match) return undefined;
  const [, prefix, middle, type] = match;
  return middle === undefined ? { prefix, type } : { prefix, middle, type };
}

// VATUSA's position pattern, as training-tools checks it (`lib/ctrs.ts`).
const VATUSA_POSITION =
  /^([A-Z0-9]{2,3})(_([A-Z0-9]{1,3}))?_(DEL|GND|TWR|APP|DEP|CTR|FSS)$/;

/**
 * Whether VATUSA takes the text as a position, as in a training record:
 * `IND_GND`, `IND_83_CTR`. It checks the text exactly as VATUSA will, so
 * upper-case what a member types first. `RMP` and `TMU` aren't positions to
 * VATUSA.
 */
export function isPosition(callsign: string): boolean {
  return VATUSA_POSITION.test(callsign);
}

/**
 * The position types, in order from the ground up: the order to list
 * positions in. VATUSA's types, plus vNAS's `RMP`. Names are the spoken
 * forms of FAA JO 7110.65 2-4-19, with "Flight Service" for `FSS`.
 */
export const POSITION_TYPES = [
  { type: "DEL", name: "Clearance Delivery" },
  { type: "RMP", name: "Ramp" },
  { type: "GND", name: "Ground" },
  { type: "TWR", name: "Tower" },
  { type: "APP", name: "Approach" },
  { type: "DEP", name: "Departure" },
  { type: "CTR", name: "Center" },
  { type: "FSS", name: "Flight Service" },
] as const;

/** One of the types in `POSITION_TYPES`: `"GND"`, `"CTR"`. */
export type PositionType = (typeof POSITION_TYPES)[number]["type"];

function rank(callsign: string): number {
  const type = parseCallsign(callsign)?.type;
  const index = POSITION_TYPES.findIndex((t) => t.type === type);
  return index === -1 ? POSITION_TYPES.length : index;
}

/**
 * Compares two callsigns by position type, for `sort`: delivery first,
 * centre last, then any other type (`ZID_TMU`) and text that isn't a
 * callsign. Callsigns of one type keep their order.
 */
export function comparePositionTypes(a: string, b: string): number {
  return rank(a) - rank(b);
}
