import { mdiStar, mdiStarHalfFull, mdiStarOutline } from "@mdi/js";
import { describe, expect, test } from "vitest";
import {
  clampStars,
  starLabel,
  starLook,
  starsInWords,
  toHalfStar,
} from "./stars.ts";

describe("clampStars", () => {
  test.each([
    [3, 3],
    [4.3, 4.3],
    [0, 0],
    [5, 5],
    [7, 5],
    [-1, 0],
  ])("%s is %s", (value, clamped) => {
    expect(clampStars(value)).toBe(clamped);
  });
});

describe("toHalfStar", () => {
  test.each([
    [4.3, 4.5],
    [4.2, 4],
    [4.25, 4.5],
    [4.75, 5],
    [3, 3],
    [7, 5],
    [-1, 0],
  ])("%s is %s", (value, half) => {
    expect(toHalfStar(value)).toBe(half);
  });
});

describe("starsInWords", () => {
  test.each([
    [4, "4 out of 5"],
    [4.3, "4.3 out of 5"],
    [0, "0 out of 5"],
  ])("%s is %s", (value, words) => {
    expect(starsInWords(value)).toBe(words);
  });
});

describe("starLabel", () => {
  test.each([
    [1, "1 star"],
    [2, "2 stars"],
    [5, "5 stars"],
  ])("%s is %s", (star, label) => {
    expect(starLabel(star)).toBe(label);
  });
});

describe("starLook", () => {
  const filled = { path: mdiStar, colour: "text-warning" };
  const half = { path: mdiStarHalfFull, colour: "text-warning" };
  const outline = { path: mdiStarOutline, colour: "text-muted-foreground" };
  test.each([
    [3, 4, filled],
    [4, 4, filled],
    [5, 4.5, half],
    [5, 4, outline],
    [1, 0, outline],
  ])("star %s of a %s rating is %o", (star, value, look) => {
    expect(starLook(star, value)).toEqual(look);
  });
});
