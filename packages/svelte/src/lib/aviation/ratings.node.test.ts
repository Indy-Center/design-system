import { describe, expect, test } from "vitest";
import {
  findPilotRating,
  findRating,
  PILOT_RATINGS,
  RATINGS,
} from "./ratings.ts";

describe("RATINGS", () => {
  test("is VATSIM's table, in its order, named as VATSIM names them", () => {
    expect(RATINGS.map((r) => [r.id, r.short, r.long])).toEqual([
      [-1, "INAC", "Inactive"],
      [0, "SUS", "Suspended"],
      [1, "OBS", "Observer"],
      [2, "S1", "Tower Trainee"],
      [3, "S2", "Tower Controller"],
      [4, "S3", "Senior Student"],
      [5, "C1", "Enroute Controller"],
      [6, "C2", "Controller 2 (not in use)"],
      [7, "C3", "Senior Controller"],
      [8, "I1", "Instructor"],
      [9, "I2", "Instructor 2 (not in use)"],
      [10, "I3", "Senior Instructor"],
      [11, "SUP", "Supervisor"],
      [12, "ADM", "Administrator"],
    ]);
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
