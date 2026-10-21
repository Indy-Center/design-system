import { describe, expect, test } from "vitest";
import { formatFrequency, spokenFrequency } from "./frequency.ts";

describe("formatFrequency", () => {
  test.each([
    [128_225_000, "128.22"],
    [121_500_000, "121.50"],
    [118_050_000, "118.05"],
    [135_775_000, "135.77"],
    [132_175_000, "132.17"],
  ])("%d Hz is %s: two decimals, the third cut", (hz, text) => {
    expect(formatFrequency(hz)).toBe(text);
  });

  test.each([
    [128_225_000, "128.225"],
    [121_500_000, "121.500"],
    [118_050_000, "118.050"],
  ])("with decimals 3, %d Hz is %s", (hz, text) => {
    expect(formatFrequency(hz, { decimals: 3 })).toBe(text);
  });

  // A third decimal only exists for an 8.33 kHz channel: anything finer
  // than a whole kHz is cut, never rounded into the digits shown.
  test.each([
    [128_229_900, 2, "128.22"],
    [128_229_900, 3, "128.229"],
    [121_899_999, 2, "121.89"],
    [121_899_999, 3, "121.899"],
  ] as const)(
    "%d Hz with decimals %d is %s, not rounded",
    (hz, decimals, text) => {
      expect(formatFrequency(hz, { decimals })).toBe(text);
    },
  );
});

describe("spokenFrequency, per FAA JO 7110.65 2-4-17", () => {
  // The order's own examples.
  test.each([
    [135_275_000, "one three five point two seven"],
    [126_550_000, "one two six point five five"],
    [121_500_000, "one two one point five"],
    [369_000_000, "three six niner point zero"],
  ])("%d Hz is said %s", (hz, words) => {
    expect(spokenFrequency(hz)).toBe(words);
  });

  test("drops the digits after the second decimal", () => {
    expect(spokenFrequency(128_225_000)).toBe("one two eight point two two");
  });

  test("keeps a zero before a digit", () => {
    expect(spokenFrequency(118_050_000)).toBe("one one eight point zero five");
  });

  // Said as shown: with three decimals, the third is said too (128.225 is
  // with ICAO's below).
  test.each([
    [132_175_000, "one three two point one seven five"],
    [128_229_900, "one two eight point two two niner"],
  ])("with decimals 3, %d Hz is said %s", (hz, words) => {
    expect(spokenFrequency(hz, { decimals: 3 })).toBe(words);
  });
});

describe("spokenFrequency with decimals 3, per ICAO Annex 10 Vol II", () => {
  // All six digits, unless the fifth and sixth are both zero: then four.
  test.each([
    [121_510_000, "one two one point five one zero"],
    [118_050_000, "one one eight point zero five zero"],
    [118_005_000, "one one eight point zero zero five"],
    [128_225_000, "one two eight point two two five"],
  ])("%d Hz is said in six digits: %s", (hz, words) => {
    expect(spokenFrequency(hz, { decimals: 3 })).toBe(words);
  });

  test.each([
    [121_500_000, "one two one point five"],
    [118_100_000, "one one eight point one"],
    [369_000_000, "three six niner point zero"],
  ])("%d Hz, fifth and sixth zero, is said in four: %s", (hz, words) => {
    expect(spokenFrequency(hz, { decimals: 3 })).toBe(words);
  });
});
