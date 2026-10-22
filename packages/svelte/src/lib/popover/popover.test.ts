import { describe, expect, test } from "vitest";
import { renderIn } from "../../../test/schemes.ts";
import Popover from "./popover.test.svelte";

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

  const centre = (box: DOMRect) => box.left + box.width / 2;

  test("places the panel under its anchor, centred on it", async () => {
    const screen = await renderIn("light", Popover, {
      open: true,
      area: "bottom",
    });

    const button = screen
      .getByRole("button", { name: "Apps" })
      .element()
      .getBoundingClientRect();
    const panel = screen
      .getByText("Some text")
      .element()
      .getBoundingClientRect();
    expect(panel.top).toBeGreaterThanOrEqual(button.bottom);
    expect(Math.round(centre(panel))).toBe(Math.round(centre(button)));
  });

  test("places the panel above its anchor when asked", async () => {
    const screen = await renderIn("light", Popover, {
      open: true,
      area: "top",
    });

    const button = screen
      .getByRole("button", { name: "Apps" })
      .element()
      .getBoundingClientRect();
    const panel = screen
      .getByText("Some text")
      .element()
      .getBoundingClientRect();
    expect(panel.bottom).toBeLessThanOrEqual(button.top);
    expect(Math.round(centre(panel))).toBe(Math.round(centre(button)));
  });

  test("two on a page each go against their own anchor", async () => {
    const first = await renderIn("light", Popover, { open: true });
    await renderIn("light", Popover, { open: true });

    const button = first
      .getByRole("button", { name: "Apps" })
      .element()
      .getBoundingClientRect();
    const panel = first
      .getByText("Some text")
      .element()
      .getBoundingClientRect();
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

    const button = screen
      .getByRole("button", { name: "Apps" })
      .element()
      .getBoundingClientRect();
    const panel = screen
      .getByText("Some text")
      .element()
      .getBoundingClientRect();
    expect(panel.top).toBeGreaterThanOrEqual(button.bottom);
  });
});
