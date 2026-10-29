import { describe, expect, test } from "vitest";
import zid from "../../../test/zid-positions.json";
import { resolvePosition, type VnasPosition } from "./resolvePosition.ts";

// ZID's 157 positions from vNAS Data Admin, slimmed, read 2026-10-20.
const positions: VnasPosition[] = zid;

function byCallsign(callsign: string): VnasPosition {
  const position = positions.find((p) => p.callsign === callsign);
  if (!position) throw new Error(`${callsign} isn't in the snapshot`);
  return position;
}

describe("resolvePosition", () => {
  // One digit added is tried against every position below; this is a
  // middle of more than one digit dropped.
  test("resolves the relief login LEX_12_TWR to LEX_TWR", () => {
    expect(resolvePosition("LEX_12_TWR", positions)).toEqual({
      match: "relief",
      position: byCallsign("LEX_TWR"),
    });
  });

  test.each([
    // Not ZID's.
    "MEM_221_CTR",
    // The prefix changed: no rule covers it.
    "DCA_J1_APP",
    // A letter added, not a digit.
    "IND_83A_CTR",
    // A letter middle isn't dropped.
    "IND_X_GND",
    // A single-digit middle stays: there is no IND_8_CTR.
    "IND_8_CTR",
    "AAL123",
    "",
  ])("leaves %j unknown", (callsign) => {
    expect(resolvePosition(callsign, positions)).toBeUndefined();
  });

  test("given the person's vNAS position id, matches on that instead", () => {
    const position = byCallsign("IND_83_CTR");
    expect(
      resolvePosition("IND_E_APP", positions, { positionId: position.id }),
    ).toEqual({ match: "id", position });
    expect(
      resolvePosition("IND_83_CTR", positions, { positionId: "not-zid" }),
    ).toBeUndefined();
  });
});

describe("the relief rule against all of ZID's positions", () => {
  test("every callsign matches its own position exactly", () => {
    for (const position of positions) {
      expect(resolvePosition(position.callsign, positions)).toEqual({
        match: "exact",
        position,
      });
    }
  });

  test("a relief login of each, with any digit, resolves to it as relief", () => {
    for (const position of positions) {
      const [prefix, middle, type] = position.callsign.split("_");
      for (const digit of "0123456789") {
        const login =
          type === undefined
            ? // No middle: a numbered relief, IND_GND as IND_1_GND.
              `${prefix}_${digit}_${middle}`
            : // A digit added to the middle, IND_83_CTR as IND_831_CTR.
              `${prefix}_${middle}${digit}_${type}`;
        expect(resolvePosition(login, positions)).toEqual({
          match: "relief",
          position,
        });
      }
    }
  });

  test("no rule lands on a different real position", () => {
    // Were a callsign a relief login, its own position missing, would a
    // rule resolve it to another one?
    const landed = positions.flatMap((position) => {
      const others = positions.filter((p) => p !== position);
      const resolved = resolvePosition(position.callsign, others);
      return resolved
        ? [`${position.callsign} → ${resolved.position.callsign}`]
        : [];
    });
    expect(landed).toEqual([]);
  });
});
