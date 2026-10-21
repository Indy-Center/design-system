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
 * each digit, "point" for the decimal, and the decimals `formatFrequency`
 * shows: `128225000` is "one two eight point two two", or "… two two five"
 * with `decimals: 3`; `121500000` is "one two one point five".
 *
 * Three decimals name an 8.33 kHz channel, said by ICAO's rule (Annex 10
 * Vol II): all six digits, unless the fifth and sixth are both zero, then
 * the first four. `121510000` is "one two one point five one zero".
 */
export function spokenFrequency(
  hz: number,
  options: FrequencyOptions = {},
): string {
  const [whole, decimals] = formatFrequency(hz, options).split(".");
  const kept =
    options.decimals === 3
      ? decimals.replace(/00$/, "")
      : // Trailing zeros go ("121.5"), but one digit always stays ("369.0").
        decimals.replace(/(?<=.)0+$/, "");
  return `${say(whole)} point ${say(kept)}`;
}
