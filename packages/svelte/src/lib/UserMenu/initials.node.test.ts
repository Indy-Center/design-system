import { expect, test } from "vitest";
import { initials } from "./initials.ts";

test.each([
  ["Sam Rivera", "SR"],
  ["sam rivera", "SR"],
  ["Mary Ann Smith", "MS"],
  ["  Sam   Rivera  ", "SR"],
  ["Sam", "S"],
  ["Élodie Ørsted", "ÉØ"],
  ["Jean-Luc Picard", "JP"],
  ["", ""],
  ["   ", ""],
])("initials(%j) is %j", (name, expected) => {
  expect(initials(name)).toBe(expected);
});
