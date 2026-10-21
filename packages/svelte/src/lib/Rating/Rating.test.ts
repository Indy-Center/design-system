import { describe, expect, onTestFinished, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { expectReadable, SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Rating from "./Rating.svelte";

/** The chip's markup for `rating`, cleaned up after. */
async function chipFor(rating: number | string, kind?: "controller" | "pilot") {
  const screen = await renderIn("light", Rating, { rating, kind });
  const html = screen.container.innerHTML;
  screen.unmount();
  return html;
}

describe("Rating", () => {
  test("is a mono chip holding the short code in an abbr titled with the long name", async () => {
    const screen = await renderIn("light", Rating, { rating: "C1" });
    const abbr = screen.getByTitle("Enroute Controller");
    expect(abbr.element().tagName).toBe("ABBR");
    expect(abbr.element().firstChild!.textContent).toBe("C1");
    const chip = abbr.element().parentElement!;
    expect(chip.tagName).toBe("SPAN");
    expect(getComputedStyle(chip).fontFamily).toMatch(/monospace/);
  });

  test.each([5, "Controller1", "c1", "Enroute Controller"])(
    "%j gives the same chip as C1",
    async (rating) => {
      expect(await chipFor(rating)).toBe(await chipFor("C1"));
    },
  );

  test("reads as the code and the long name, which shows only on focus", async () => {
    const screen = await renderIn("light", Rating, { rating: 5 });
    const abbr = screen.getByTitle("Enroute Controller");
    await expect.element(abbr).toHaveTextContent("C1 Enroute Controller");
    await expect.element(abbr).toHaveAccessibleName(/Enroute Controller/);
    const long = screen.getByText("Enroute Controller");
    expect(long.element().getBoundingClientRect().width).toBeLessThanOrEqual(1);

    await userEvent.tab();
    await expect.element(abbr).toHaveFocus();
    expect(long.element().getBoundingClientRect().width).toBeGreaterThan(50);
    // Beneath the chip, not over it.
    expect(long.element().getBoundingClientRect().top).toBeGreaterThanOrEqual(
      abbr.element().parentElement!.getBoundingClientRect().bottom,
    );
  });

  describe.each(SCHEMES)("in %s", (scheme) => {
    // The guide's `ring` role.
    test("shows a ring around the chip on keyboard focus", async () => {
      const screen = await renderIn(scheme, Rating, { rating: "S2" });
      const chip = screen
        .getByTitle("Tower Controller")
        .element().parentElement!;
      await userEvent.tab();
      await expect.element(chip).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    });

    // The guide's `muted` fill and `foreground` text, as Chip's default.
    test("is the soft neutral chip, readable", async () => {
      const screen = await renderIn(scheme, Rating, { rating: "S3" });
      const chip = screen.getByTitle("Senior Student").element().parentElement!;
      await expect.element(chip).toHaveStyle({
        backgroundColor: role("muted", scheme),
        color: role("foreground", scheme),
      });
      expectReadable(chip, scheme);
    });

    // Inverted, so it stands off whatever it covers.
    test("shows the long name in background on foreground", async () => {
      const screen = await renderIn(scheme, Rating, { rating: "S3" });
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
      const abbr = screen.getByTitle("Instrument Rating");
      await expect.element(abbr).toHaveTextContent("IR Instrument Rating");
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
        .element(screen.getByTitle("Private Pilot License"))
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
    const chip = screen.getByTitle("Instructor").element().parentElement!;
    await expect.element(chip).toHaveAttribute("id", "rating");
    await expect.element(chip).toHaveStyle({ marginLeft: "16px" });
  });
});
