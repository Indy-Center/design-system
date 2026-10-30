import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-svelte";
import { indyCenter, indyGround } from "../../playground/positions.ts";
import PositionName from "./PositionName.test.svelte";
import Layout from "./PositionsLayout.test.svelte";

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

  // That a lookup follows when the positions change: Position.test.ts.
  test("with no layout setting them, there are no positions", async () => {
    const screen = await render(PositionName, { callsign: "IND_83_CTR" });

    await expect.element(screen.getByText("IND_83_CTR: unknown")).toBeVisible();
  });
});
