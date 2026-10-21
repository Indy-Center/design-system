import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-svelte";
import type { VnasPosition } from "../aviation/resolvePosition.ts";
import PositionName from "./PositionName.test.svelte";
import Layout from "./PositionsLayout.test.svelte";

const indyCenter: VnasPosition = {
  id: "01GFTXMTZDDJ9XKMJ7AX0EXKQF",
  callsign: "IND_83_CTR",
  name: "Falmouth 83",
  radioName: "Indy Center",
  frequency: 128225000,
  facility: "Indianapolis ARTCC",
  starred: true,
};

const indyGround: VnasPosition = {
  id: "01GRVHS2MYY06V7F3XB5HBSB09",
  callsign: "IND_GND",
  name: "Ground Control",
  radioName: "Indianapolis Ground",
  frequency: 121900000,
  facility: "Indianapolis ATCT",
  starred: true,
};

describe("setPositions and getPositions", () => {
  test("a layout sets the positions once, and every lookup below finds its own", async () => {
    const screen = await render(Layout, {
      positions: [indyCenter, indyGround],
      callsigns: ["IND_83_CTR", "IND_1_GND", "IND_X_GND"],
    });

    await expect
      .element(screen.getByText("IND_83_CTR: Indy Center"))
      .toBeVisible();
    await expect
      .element(screen.getByText("IND_1_GND: Indianapolis Ground"))
      .toBeVisible();
    await expect.element(screen.getByText("IND_X_GND: unknown")).toBeVisible();
  });

  test("lookups follow when the layout's positions change", async () => {
    const screen = await render(Layout, {
      positions: [],
      callsigns: ["IND_83_CTR"],
    });
    await expect.element(screen.getByText("IND_83_CTR: unknown")).toBeVisible();

    await screen.rerender({ positions: [indyCenter] });

    await expect
      .element(screen.getByText("IND_83_CTR: Indy Center"))
      .toBeVisible();
  });

  test("with no layout setting them, there are no positions", async () => {
    const screen = await render(PositionName, { callsign: "IND_83_CTR" });

    await expect.element(screen.getByText("IND_83_CTR: unknown")).toBeVisible();
  });
});
