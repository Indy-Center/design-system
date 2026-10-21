// A few of ZID's positions, as `fetchPositions("ZID")` gives them, for
// Position's and Frequency's playground pages and tests.
import type { VnasPosition } from "../lib/aviation/resolvePosition.ts";

export const indyCenter: VnasPosition = {
  id: "01GFTXMTZDDJ9XKMJ7AX0EXKQF",
  callsign: "IND_83_CTR",
  name: "Falmouth 83",
  radioName: "Indy Center",
  frequency: 128225000,
  facility: "Indianapolis ARTCC",
  starred: true,
};

export const lexingtonTower: VnasPosition = {
  id: "01GRVHS2MYY06V7F3XB5HBSB08",
  callsign: "LEX_TWR",
  name: "Local Control",
  radioName: "Lexington Tower",
  frequency: 119100000,
  facility: "Lexington ATCT/TRACON",
  starred: true,
};

export const lexingtonApproach: VnasPosition = {
  id: "01GRVHT229661VM1FDJVEEZNK1",
  callsign: "LEX_E_APP",
  name: "Radar East",
  radioName: "Lexington Approach",
  frequency: 120150000,
  facility: "Lexington ATCT/TRACON",
  starred: true,
};

export const indyGround: VnasPosition = {
  id: "01GRSYZPTF16VKS2NB995ZD58T",
  callsign: "IND_GND",
  name: "Ground Control",
  radioName: "Indianapolis Ground",
  frequency: 121900000,
  facility: "Indianapolis ATCT/TRACON",
  starred: true,
};

export const samplePositions: VnasPosition[] = [
  indyCenter,
  lexingtonTower,
  lexingtonApproach,
  indyGround,
];
