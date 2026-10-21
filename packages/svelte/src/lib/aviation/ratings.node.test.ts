import { describe, expect, test } from "vitest";
import {
  findPilotRating,
  findRating,
  PILOT_RATINGS,
  RATINGS,
} from "./ratings.ts";

describe("RATINGS", () => {
  test("is VATSIM's table, in its order", () => {
    expect(RATINGS.map((r) => [r.id, r.short])).toEqual([
      [-1, "INAC"],
      [0, "SUS"],
      [1, "OBS"],
      [2, "S1"],
      [3, "S2"],
      [4, "S3"],
      [5, "C1"],
      [6, "C2"],
      [7, "C3"],
      [8, "I1"],
      [9, "I2"],
      [10, "I3"],
      [11, "SUP"],
      [12, "ADM"],
    ]);
  });

  test("names each rating as VATSIM does", () => {
    const names = Object.fromEntries(RATINGS.map((r) => [r.short, r.long]));
    expect(names).toMatchObject({
      OBS: "Observer",
      S1: "Tower Trainee",
      S2: "Tower Controller",
      S3: "Senior Student",
      C1: "Enroute Controller",
      C3: "Senior Controller",
      I1: "Instructor",
      I3: "Senior Instructor",
      SUP: "Supervisor",
      ADM: "Administrator",
    });
  });
});

describe("findRating", () => {
  test.each([5, "C1", "Controller1", "c1", "Enroute Controller"])(
    "finds C1 from %j",
    (value) => {
      expect(findRating(value)).toMatchObject({
        id: 5,
        short: "C1",
        long: "Enroute Controller",
      });
    },
  );

  test.each([
    ["Student2", "S2"],
    ["Instructor3", "I3"],
    ["Observer", "OBS"],
    ["Supervisor", "SUP"],
    ["Administrator", "ADM"],
  ])("reads vNAS's %s as %s", (vnas, short) => {
    expect(findRating(vnas)?.short).toBe(short);
  });

  test.each([13, 5.5, "C4", "", "Student"])("%j is no rating", (value) => {
    expect(findRating(value)).toBeUndefined();
  });
});

describe("PILOT_RATINGS", () => {
  test("is VATSIM's pilot table, in its order", () => {
    expect(PILOT_RATINGS.map((r) => [r.id, r.short, r.long])).toEqual([
      [0, "NEW", "Basic Member"],
      [1, "PPL", "Private Pilot License"],
      [3, "IR", "Instrument Rating"],
      [7, "CMEL", "Commercial Multi-Engine License"],
      [15, "ATPL", "Airline Transport Pilot License"],
      [31, "FI", "Flight Instructor"],
      [63, "FE", "Flight Examiner"],
    ]);
  });
});

describe("findPilotRating", () => {
  test.each([3, "IR", "ir", "Instrument Rating"])(
    "finds IR from %j",
    (value) => {
      expect(findPilotRating(value)).toMatchObject({
        id: 3,
        short: "IR",
        long: "Instrument Rating",
      });
    },
  );

  test.each([2, "C1", "P2", ""])("%j is no pilot rating", (value) => {
    expect(findPilotRating(value)).toBeUndefined();
  });
});
