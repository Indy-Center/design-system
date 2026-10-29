import { describe, expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Rating from "./Rating.svelte";

// The aliases each rating is found by are ratings.node.test.ts's; how the
// code, long name and tooltip behave is AbbrTooltip.test.ts's.

type Screen = RenderResult<typeof Rating>;

// An abbr has no role, so it is found by its tag.
const abbr = (screen: Screen) =>
  page.elementLocator(screen.container.querySelector("abbr")!);
const chip = (screen: Screen) =>
  page.elementLocator(abbr(screen).element().parentElement!);
// Hidden from screen readers, so found with includeHidden.
const tooltip = (screen: Screen) =>
  screen.getByRole("tooltip", { includeHidden: true });

describe("Rating", () => {
  // Chip's muted variant, the guide's `ring` round the chip.
  test("is a muted chip with the code in an AbbrTooltip, its long name in the tooltip", async () => {
    const screen = await renderIn("light", Rating, {
      rating: 5,
      focusable: true,
    });
    await expect
      .element(abbr(screen))
      .toHaveTextContent("C1 Enroute Controller");
    await expect
      .element(chip(screen))
      .toHaveStyle({ backgroundColor: role("muted", "light") });

    await userEvent.tab();

    await expect.element(abbr(screen)).toHaveFocus();
    await expect
      .element(tooltip(screen))
      .toHaveTextContent("Enroute Controller");
    await expect.element(tooltip(screen)).toBeVisible();
    await expect.element(chip(screen)).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  // A roster column would otherwise have one tab stop per row.
  test("is no tab stop unless focusable", async () => {
    const screen = await renderIn("light", Rating, { rating: 5 });
    expect(screen.container.querySelector("[tabindex]")).toBeNull();
  });

  describe("for a pilot", () => {
    test("IR reads as IR, Instrument Rating", async () => {
      const screen = await renderIn("light", Rating, {
        rating: "IR",
        kind: "pilot",
      });
      await expect
        .element(abbr(screen))
        .toHaveTextContent("IR Instrument Rating");
    });

    test("reads numbers from the pilot table, not the controller one", async () => {
      const screen = await renderIn("light", Rating, {
        rating: 1,
        kind: "pilot",
      });
      await expect
        .element(abbr(screen))
        .toHaveTextContent("PPL Private Pilot License");
    });
  });

  test("shows what it was given, plain, when it is no rating, and warns", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    onTestFinished(() => warn.mockRestore());
    const screen = await renderIn("light", Rating, { rating: "C4" });
    await expect.element(screen.getByText("C4")).toBeVisible();
    expect(screen.container.querySelector("abbr")).toBeNull();
    expect(screen.container.querySelector("[tabindex]")).toBeNull();
    expect(screen.container.querySelector("[role=tooltip]")).toBeNull();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"C4"'));
  });

  // class is for layout, so it goes on the outermost box.
  test("adds a caller's class to the box round the chip, and attributes to the chip", async () => {
    const screen = await renderIn("light", Rating, {
      rating: "I1",
      class: "ml-4",
      id: "rating",
    });
    await expect.element(chip(screen)).toHaveAttribute("id", "rating");
    const box = chip(screen).element().parentElement!;
    expect(box).toContainElement(tooltip(screen).element() as HTMLElement);
    expect(getComputedStyle(box).marginLeft).toBe("16px");
  });

  test("adds a caller's class and attributes to an unknown value's chip", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    onTestFinished(() => warn.mockRestore());
    const screen = await renderIn("light", Rating, {
      rating: "C4",
      class: "ml-4",
      id: "rating",
    });
    const plain = screen.getByText("C4");
    await expect.element(plain).toHaveAttribute("id", "rating");
    await expect.element(plain).toHaveStyle({ marginLeft: "16px" });
  });
});
