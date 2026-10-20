/**
 * A frequency in hertz, as vNAS gives it, in megahertz with three decimals:
 * `128225000` is `"128.225"`.
 */
export function formatFrequency(hz: number): string {
  return (hz / 1_000_000).toFixed(3);
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
  const kept = decimals.slice(0, 2).replace(/(?<=.)0$/, "");
  return `${say(whole)} point ${say(kept)}`;
}
