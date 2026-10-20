import { describe, expect, test } from "vitest";
import {
  comparePositionTypes,
  isPosition,
  parseCallsign,
  POSITION_TYPES,
} from "./callsign.ts";

describe("parseCallsign", () => {
  test("splits a callsign with a middle part", () => {
    expect(parseCallsign("IND_83_CTR")).toEqual({
      prefix: "IND",
      middle: "83",
      type: "CTR",
    });
  });

  test("leaves the middle out when there is none", () => {
    expect(parseCallsign("LEX_TWR")).toEqual({ prefix: "LEX", type: "TWR" });
  });

  test("reads types outside VATUSA's list and observer logins", () => {
    expect(parseCallsign("ZID_TMU")).toEqual({ prefix: "ZID", type: "TMU" });
    expect(parseCallsign("1714903_OBS")).toEqual({
      prefix: "1714903",
      type: "OBS",
    });
  });

  test.each(["AAL123", "IND_A_B_CTR", "IND__CTR", "ind_gnd", " IND_GND", ""])(
    "%j is not a callsign",
    (text) => {
      expect(parseCallsign(text)).toBeUndefined();
    },
  );
});

describe("isPosition, VATUSA's pattern", () => {
  test.each([
    "IND_GND",
    "ZID_CTR",
    "IND_83_CTR",
    "IND_E_APP",
    "IND_831_CTR",
    "CVG_DEP",
    "IND_DEL",
    "IND_FSS",
    "DAY_M_APP",
  ])("%s is a position", (callsign) => {
    expect(isPosition(callsign)).toBe(true);
  });

  test.each([
    // Types VATUSA doesn't take.
    "CVG_1_RMP",
    "ZID_TMU",
    "1714903_OBS",
    // A prefix of two or three, a middle of one to three.
    "I_GND",
    "INDY_GND",
    "IND_8311_CTR",
    "ind_gnd",
    "AAL123",
  ])("%s is not", (callsign) => {
    expect(isPosition(callsign)).toBe(false);
  });
});

describe("POSITION_TYPES", () => {
  test("run from the ground up, CTR and DEP included", () => {
    expect(POSITION_TYPES.map((t) => t.type)).toEqual([
      "DEL",
      "RMP",
      "GND",
      "TWR",
      "APP",
      "DEP",
      "CTR",
      "FSS",
    ]);
  });

  test("name each type", () => {
    expect(POSITION_TYPES.find((t) => t.type === "DEL")?.name).toBe(
      "Clearance Delivery",
    );
    expect(POSITION_TYPES.find((t) => t.type === "CTR")?.name).toBe("Center");
  });
});

describe("comparePositionTypes", () => {
  test("sorts callsigns by type, unknown types and non-callsigns last", () => {
    const callsigns = [
      "ZID_TMU",
      "IND_83_CTR",
      "AAL123",
      "IND_E_APP",
      "IND_GND",
      "CVG_1_RMP",
      "IND_TWR",
      "CVG_DEP",
      "IND_DEL",
    ];
    expect(callsigns.sort(comparePositionTypes)).toEqual([
      "IND_DEL",
      "CVG_1_RMP",
      "IND_GND",
      "IND_TWR",
      "IND_E_APP",
      "CVG_DEP",
      "IND_83_CTR",
      "ZID_TMU",
      "AAL123",
    ]);
  });

  test("leaves callsigns of one type in the order given", () => {
    const centres = ["IND_87_CTR", "IND_30_CTR", "IND_83_CTR"];
    expect([...centres].sort(comparePositionTypes)).toEqual(centres);
  });
});
