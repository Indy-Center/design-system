import { describe, expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { expectReadable, SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Rating from "./Rating.svelte";
import InCell from "./Rating.test.svelte";

type Screen = RenderResult<typeof Rating>;

// An abbr has no role, so it is found by its tag.
const abbr = (screen: Screen) =>
  page.elementLocator(screen.container.querySelector("abbr")!);
const chip = (screen: Screen) =>
  page.elementLocator(abbr(screen).element().parentElement!);

/** The chip's markup for `rating`, cleaned up after. */
async function chipFor(rating: number | string, kind?: "controller" | "pilot") {
  const screen = await renderIn("light", Rating, { rating, kind });
  const html = screen.container.innerHTML;
  screen.unmount();
  return html;
}

describe("Rating", () => {
  test("is a mono chip holding the short code in an abbr", async () => {
    const screen = await renderIn("light", Rating, { rating: "C1" });
    expect(abbr(screen).element().firstChild!.textContent).toBe("C1");
    expect(chip(screen).element().tagName).toBe("SPAN");
    expect(getComputedStyle(chip(screen).element()).fontFamily).toMatch(
      /monospace/,
    );
  });

  // Some screen readers said the long name twice, and the browser's own
  // tooltip would show beside the chip's.
  test("gives the abbr no title", async () => {
    const screen = await renderIn("light", Rating, { rating: "C1" });
    await expect.element(abbr(screen)).not.toHaveAttribute("title");
  });

  test.each([5, "Controller1", "c1", "Enroute Controller"])(
    "%j gives the same chip as C1",
    async (rating) => {
      expect(await chipFor(rating)).toBe(await chipFor("C1"));
    },
  );

  test("reads as the code and the long name, once", async () => {
    const screen = await renderIn("light", InCell, { rating: 5 });
    await expect
      .element(screen.getByRole("cell"))
      .toHaveAccessibleName("C1 Enroute Controller");
  });

  // A roster column would otherwise have one tab stop per row.
  test("is no tab stop unless focusable", async () => {
    const screen = await renderIn("light", Rating, { rating: 5 });
    expect(screen.container.querySelector("[tabindex]")).toBeNull();

    await userEvent.tab();

    await expect.element(abbr(screen)).not.toHaveFocus();
  });

  test("shows the long name only on focus, when focusable", async () => {
    const screen = await renderIn("light", Rating, {
      rating: 5,
      focusable: true,
    });
    const long = screen.getByText("Enroute Controller");
    expect(long.element().getBoundingClientRect().width).toBeLessThanOrEqual(1);

    await userEvent.tab();
    await expect.element(abbr(screen)).toHaveFocus();
    expect(long.element().getBoundingClientRect().width).toBeGreaterThan(50);
    // Beneath the chip, not over it.
    expect(long.element().getBoundingClientRect().top).toBeGreaterThanOrEqual(
      chip(screen).element().getBoundingClientRect().bottom,
    );
  });

  describe.each(SCHEMES)("in %s", (scheme) => {
    // The guide's `ring` role.
    test("shows a ring around the chip on keyboard focus", async () => {
      const screen = await renderIn(scheme, Rating, {
        rating: "S2",
        focusable: true,
      });
      await userEvent.tab();
      await expect.element(chip(screen)).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    });

    // The guide's `muted` fill and `foreground` text, as Chip's default.
    test("is the soft neutral chip, readable", async () => {
      const screen = await renderIn(scheme, Rating, { rating: "S3" });
      await expect.element(chip(screen)).toHaveStyle({
        backgroundColor: role("muted", scheme),
        color: role("foreground", scheme),
      });
      expectReadable(chip(screen).element(), scheme);
    });

    // Inverted, so it stands off whatever it covers.
    test("shows the long name in background on foreground", async () => {
      const screen = await renderIn(scheme, Rating, {
        rating: "S3",
        focusable: true,
      });
      await userEvent.tab();
      await expect.element(screen.getByText("Senior Student")).toHaveStyle({
        backgroundColor: role("foreground", scheme),
        color: role("background", scheme),
      });
    });
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

    test.each([3, "ir", "Instrument Rating"])(
      "%j gives the same chip as IR",
      async (rating) => {
        expect(await chipFor(rating, "pilot")).toBe(
          await chipFor("IR", "pilot"),
        );
      },
    );

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
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"C4"'));
  });

  test("adds a caller's class and attributes to the chip", async () => {
    const screen = await renderIn("light", Rating, {
      rating: "I1",
      class: "ml-4",
      id: "rating",
    });
    await expect.element(chip(screen)).toHaveAttribute("id", "rating");
    await expect.element(chip(screen)).toHaveStyle({ marginLeft: "16px" });
  });
});
