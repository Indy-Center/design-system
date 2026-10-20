import { describe, expect, test } from "vitest";
import { formatFrequency, spokenFrequency } from "./frequency.ts";

describe("formatFrequency", () => {
  test.each([
    [128_225_000, "128.225"],
    [121_500_000, "121.500"],
    [118_050_000, "118.050"],
    [135_775_000, "135.775"],
  ])("%d Hz is %s", (hz, text) => {
    expect(formatFrequency(hz)).toBe(text);
  });
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
});
