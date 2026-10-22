import { describe, expect, test } from "vitest";
import type { RenderResult } from "vitest-browser-svelte";
import { renderIn } from "../../../test/schemes.ts";
import Popover from "./popover.test.svelte";

type Screen = RenderResult<typeof Popover>;

const boxes = (screen: Screen) => ({
  button: screen
    .getByRole("button", { name: "Apps" })
    .element()
    .getBoundingClientRect(),
  panel: screen.getByText("Some text").element().getBoundingClientRect(),
});

const centre = (box: DOMRect) => box.left + box.width / 2;

describe("popover", () => {
  test("shows the panel while open, and hides it once closed", async () => {
    const screen = await renderIn("light", Popover, {});
    const button = screen.getByRole("button", { name: "Apps" });
    const panel = screen.getByText("Some text");
    await expect.element(panel).not.toBeVisible();

    await button.click();
    await expect.element(panel).toBeVisible();

    await button.click();
    await expect.element(panel).not.toBeVisible();
  });

  test("starts showing when it starts open", async () => {
    const screen = await renderIn("light", Popover, { open: true });

    await expect.element(screen.getByText("Some text")).toBeVisible();
  });

  test("places the panel under its anchor, centred on it", async () => {
    const screen = await renderIn("light", Popover, {
      open: true,
      area: "bottom",
    });

    const { button, panel } = boxes(screen);
    expect(panel.top).toBeGreaterThanOrEqual(button.bottom);
    expect(Math.round(centre(panel))).toBe(Math.round(centre(button)));
  });

  test("places the panel above its anchor when asked", async () => {
    const screen = await renderIn("light", Popover, {
      open: true,
      area: "top",
    });

    const { button, panel } = boxes(screen);
    expect(panel.bottom).toBeLessThanOrEqual(button.top);
    expect(Math.round(centre(panel))).toBe(Math.round(centre(button)));
  });

  test("two on a page each go against their own anchor", async () => {
    const first = await renderIn("light", Popover, { open: true });
    await renderIn("light", Popover, { open: true });

    const { button, panel } = boxes(first);
    expect(panel.top).toBeGreaterThanOrEqual(button.bottom);
    expect(panel.top - button.bottom).toBeLessThan(8);
  });

  test("with no room above, flips below when its fallbacks allow", async () => {
    const screen = await renderIn("light", Popover, {
      open: true,
      area: "top",
      fallbacks: "flip-block",
      atTop: true,
    });

    const { button, panel } = boxes(screen);
    expect(panel.top).toBeGreaterThanOrEqual(button.bottom);
  });

  // A caller's `style` on the trigger or the panel (a Tooltip's rest props)
  // replaces the whole attribute when it changes.
  test("stays against its anchor when the caller's style changes", async () => {
    const screen = await renderIn("light", Popover, {
      open: true,
      area: "bottom",
      style: "color: red",
    });

    await screen.rerender({ style: "color: blue" });

    const { button, panel } = boxes(screen);
    expect(panel.top).toBeGreaterThanOrEqual(button.bottom);
    expect(Math.round(centre(panel))).toBe(Math.round(centre(button)));
  });
});
