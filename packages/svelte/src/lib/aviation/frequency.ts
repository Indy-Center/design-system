export type FrequencyOptions = {
  /** `2` (the default), or `3` for an 8.33 kHz channel. */
  decimals?: 2 | 3;
};

/**
 * A frequency in hertz, as vNAS gives it, in megahertz with two decimals,
 * the rest cut, never rounded: `128225000` is `"128.22"`, or `"128.225"`
 * with `decimals: 3`. Anything finer than a whole kHz is cut too.
 */
export function formatFrequency(
  hz: number,
  { decimals = 2 }: FrequencyOptions = {},
): string {
  // Whole kHz, in integers, so no float rounds a digit up.
  const khz = Math.floor(hz / 1000);
  const mhz = Math.floor(khz / 1000);
  const fraction = String(khz % 1000).padStart(3, "0");
  return `${mhz}.${fraction.slice(0, decimals)}`;
}

// 7110.65 2-4-16: nine is "niner".
const DIGITS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "niner",
];

function say(digits: string): string {
  return [...digits].map((digit) => DIGITS[Number(digit)]).join(" ");
}

/**
 * A frequency in hertz as a controller says it, per FAA JO 7110.65 2-4-17:
 * each digit, "point" for the decimal, and nothing after the second
 * decimal. `128225000` is "one two eight point two two"; `121500000` is
 * "one two one point five".
 */
export function spokenFrequency(hz: number): string {
  const [whole, decimals] = formatFrequency(hz).split(".");
  // A trailing zero goes ("121.5"), but one digit always stays ("369.0").
  const kept = decimals.replace(/(?<=.)0$/, "");
  return `${say(whole)} point ${say(kept)}`;
}
