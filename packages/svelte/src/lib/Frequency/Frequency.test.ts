import { describe, expect, test } from "vitest";
import { indyCenter, indyGround } from "../../playground/positions.ts";
import { onScreen, readOut } from "../../../test/readOut.ts";
import { renderIn } from "../../../test/schemes.ts";
import WithPositions from "../../../test/WithPositions.svelte";
import Frequency from "./Frequency.svelte";

// How a frequency is written and said is aviation/frequency.node.test.ts's;
// how a value is read as hertz, hertz.node.test.ts's.

describe("Frequency", () => {
  test("shows two decimals, read out as spoken", async () => {
    const screen = await renderIn("light", Frequency, { value: 128225000 });
    const host = screen.container.firstElementChild!;
    expect(onScreen(host)).toBe("128.22");
    expect(readOut(host)).toBe("one two eight point two two");
  });

  test("with decimals={3}, shows and reads out the third decimal", async () => {
    const screen = await renderIn("light", Frequency, {
      value: 128225000,
      decimals: 3,
    });
    const host = screen.container.firstElementChild!;
    expect(onScreen(host)).toBe("128.225");
    expect(readOut(host)).toBe("one two eight point two two five");
  });

  test("takes megahertz as written", async () => {
    const screen = await renderIn("light", Frequency, { value: "128.225" });
    await expect.element(screen.getByText("128.22")).toBeVisible();
  });

  test("is in mono with tabular figures", async () => {
    const screen = await renderIn("light", Frequency, { value: 128225000 });
    const host = screen.container.querySelector("span")!;
    const style = getComputedStyle(host);
    expect(style.fontFamily).toMatch(/mono/i);
    expect(style.fontVariantNumeric).toBe("tabular-nums");
  });

  // It sets no colour of its own: Position and the page colour it.
  test("takes its colour from where it sits", async () => {
    const screen = await renderIn("light", Frequency, { value: 128225000 });
    const host = screen.container.querySelector("span")!;
    const parent = getComputedStyle(host.parentElement!).color;
    expect(getComputedStyle(host).color).toBe(parent);
  });

  test("looks its frequency up from a callsign", async () => {
    const screen = await renderIn("light", WithPositions, {
      positions: [indyCenter, indyGround],
      component: Frequency,
      props: { callsign: "IND_GND" },
    });
    await expect.element(screen.getByText("121.90")).toBeVisible();
  });

  test("looks a relief login up as the position it resolves to", async () => {
    const screen = await renderIn("light", WithPositions, {
      positions: [indyCenter],
      component: Frequency,
      props: { callsign: "IND_831_CTR" },
    });
    await expect.element(screen.getByText("128.22")).toBeVisible();
  });

  test("a value wins over the callsign's", async () => {
    const screen = await renderIn("light", WithPositions, {
      positions: [indyCenter],
      component: Frequency,
      props: { callsign: "IND_83_CTR", value: 133400000 },
    });
    await expect.element(screen.getByText("133.40")).toBeVisible();
  });

  test.each([
    ["an unknown callsign", { callsign: "IND_X_CTR" }],
    ["something that isn't a frequency", { value: "soon" }],
    ["nothing", {}],
  ])("shows nothing for %s", async (_, props) => {
    const screen = await renderIn("light", WithPositions, {
      positions: [indyCenter],
      component: Frequency,
      props,
    });
    expect(screen.container.textContent).toBe("");
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Frequency, {
      value: 128225000,
      class: "ml-4",
      id: "freq",
    });
    const host = screen.container.querySelector<HTMLElement>("#freq");
    await expect.element(host).toHaveStyle({ marginLeft: "16px" });
    await expect.element(host).toHaveClass("font-mono");
  });
});
