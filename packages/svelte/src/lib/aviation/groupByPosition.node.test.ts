import { describe, expect, test } from "vitest";
import {
  indyCenter,
  lexingtonTower,
  samplePositions,
} from "../../playground/positions.ts";
import { groupByPosition } from "./groupByPosition.ts";

describe("groupByPosition", () => {
  test("puts a relief login on the position it resolves to, in the feed's order", () => {
    const jordan = { callsign: "IND_83_CTR", name: "Jordan" };
    const sam = { callsign: "LEX_TWR", name: "Sam" };
    const alex = { callsign: "IND_831_CTR", name: "Alex" };

    expect(groupByPosition([jordan, sam, alex], samplePositions)).toEqual([
      {
        callsign: "IND_83_CTR",
        position: indyCenter,
        logins: [jordan, alex],
      },
      { callsign: "LEX_TWR", position: lexingtonTower, logins: [sam] },
    ]);
  });

  test("matches on the vNAS position id when a login has one", () => {
    const jordan = {
      callsign: "IND_N_CTR",
      positionId: indyCenter.id,
      name: "Jordan",
    };
    const alex = { callsign: "IND_83_CTR", name: "Alex" };

    expect(groupByPosition([jordan, alex], samplePositions)).toEqual([
      {
        callsign: "IND_83_CTR",
        position: indyCenter,
        logins: [jordan, alex],
      },
    ]);
  });

  test("keeps each unknown callsign apart, under its own callsign", () => {
    const pat = { callsign: "CMH_LCE", name: "Pat" };
    const kim = { callsign: "MEM_221_CTR", name: "Kim" };
    const lee = { callsign: "CMH_LCE", name: "Lee" };

    expect(groupByPosition([pat, kim, lee], samplePositions)).toEqual([
      { callsign: "CMH_LCE", position: undefined, logins: [pat, lee] },
      { callsign: "MEM_221_CTR", position: undefined, logins: [kim] },
    ]);
  });

  test("gives nothing for no logins", () => {
    expect(groupByPosition([], samplePositions)).toEqual([]);
  });
});
