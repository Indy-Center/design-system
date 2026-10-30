// A few of ZID's positions, the fields centerline reads of the CMS
// catalogue's, for Position's and Frequency's playground pages and tests.
// Values from vNAS Data Admin on 2026-10-29, as the CMS copies them, with
// the short names its rules give (payload `src/positions/short-name.ts`).
import type { PositionInfo } from "../lib/aviation/resolvePosition.ts";

export const indyCenter: PositionInfo = {
  id: "01GFTXMTZDDJ9XKMJ7AX0EXKQF",
  callsign: "IND_83_CTR",
  name: "Falmouth 83",
  // vNAS's own, from the ERAM sector list.
  shortName: "FLM 83",
  radioName: "Indy Center",
  frequency: 128225000,
  retired: false,
};

export const lexingtonTower: PositionInfo = {
  id: "01GRVHS2MYY06V7F3XB5HBSB08",
  callsign: "LEX_TWR",
  name: "Local Control",
  shortName: "LEX LC",
  radioName: "Lexington Tower",
  frequency: 119100000,
  retired: false,
};

export const lexingtonApproach: PositionInfo = {
  id: "01GRVHT229661VM1FDJVEEZNK1",
  callsign: "LEX_E_APP",
  name: "Radar East",
  // The prefix and its STARS TCP's sector letter.
  shortName: "LEX E",
  radioName: "Lexington Approach",
  frequency: 120150000,
  retired: false,
};

export const indyGround: PositionInfo = {
  id: "01GRSYZPTF16VKS2NB995ZD58T",
  callsign: "IND_GND",
  name: "Ground Control",
  shortName: "IND GC",
  radioName: "Indianapolis Ground",
  frequency: 121900000,
  retired: false,
};

/** A TMU position: the CMS gives it no short name. */
export const indyTmu: PositionInfo = {
  id: "01HDV6M4SSRDHMVE6HHST8X5WT",
  callsign: "ZID_TMU",
  name: "ZID TMU",
  shortName: null,
  radioName: "ZID TMU",
  frequency: 123450000,
  retired: false,
};

/** Retired, as the CMS's seed retires it: vNAS no longer lists it. */
export const parkersburgTower: PositionInfo = {
  id: "01GMQCS4DB3KJV12D2KM83CWTV",
  callsign: "PKB_TWR",
  name: "Local Control",
  shortName: "PKB LC",
  radioName: "Parkersburg Tower",
  frequency: 123700000,
  retired: true,
};

export const samplePositions: PositionInfo[] = [
  indyCenter,
  lexingtonTower,
  lexingtonApproach,
  indyGround,
  indyTmu,
  parkersburgTower,
];
