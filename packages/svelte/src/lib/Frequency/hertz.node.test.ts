import { expect, test } from "vitest";
import { toHertz } from "./hertz.ts";

test.each([
  [128_225_000, 128_225_000],
  ["128.225", 128_225_000],
  [" 121.9 ", 121_900_000],
  ["118.825", 118_825_000],
  // Finer than a kHz stays, for formatFrequency to cut.
  ["128.2299", 128_229_900],
  // Not a frequency.
  ["soon", undefined],
  ["", undefined],
  ["  ", undefined],
  ["0", undefined],
  [0, undefined],
  [-128_225_000, undefined],
  [Number.NaN, undefined],
  [Number.POSITIVE_INFINITY, undefined],
])("%j is %j Hz", (value, hz) => {
  expect(toHertz(value)).toBe(hz);
});
