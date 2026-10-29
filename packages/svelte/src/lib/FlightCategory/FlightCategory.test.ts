import { describe, expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import {
  expectReadable,
  SCHEMES,
  translucent,
} from "../../../test/contrast.ts";
import { role, type Role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import FlightCategory, {
  FLIGHT_CATEGORIES,
  type FlightCategoryCode,
} from "./FlightCategory.svelte";

// How the code, long name and tooltip behave is AbbrTooltip.test.ts's.

type Screen = RenderResult<typeof FlightCategory>;

// An abbr has no role, so it is found by its tag.
const abbr = (screen: Screen) =>
  page.elementLocator(screen.container.querySelector("abbr")!);
const badge = (screen: Screen) => abbr(screen).element().parentElement!;
// Hidden from screen readers, so found with includeHidden.
const tooltip = (screen: Screen) =>
  screen.getByRole("tooltip", { includeHidden: true });

/** `a` mixed with `b` in oklab, `percent` of `a`, as the browser computes it. */
function mixed(a: string, b: string, percent: number) {
  const probe = document.createElement("div");
  probe.style.color = `color-mix(in oklab, ${a} ${percent}%, ${b})`;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

// The FAA's colours on the roles. Each tinted category's text is its role
// a quarter towards `foreground`: in the role alone it falls short of
// 4.5:1 on its tint.
const tinted: [FlightCategoryCode, Role][] = [
  ["VFR", "success"],
  ["MVFR", "info"],
  ["IFR", "destructive"],
];

describe("FlightCategory", () => {
  test.each([
    ["VFR", "Visual flight rules"],
    ["MVFR", "Marginal visual flight rules"],
    ["IFR", "Instrument flight rules"],
    ["LIFR", "Low instrument flight rules"],
  ] as const)("reads %s as %s", async (code, name) => {
    const screen = await renderIn("light", FlightCategory, {
      category: code,
    });
    await expect.element(abbr(screen)).toHaveTextContent(`${code} ${name}`);
  });

  test("is in an AbbrTooltip, its long name in the tooltip", async () => {
    const screen = await renderIn("light", FlightCategory, {
      category: "MVFR",
      focusable: true,
    });

    await userEvent.tab();

    await expect.element(abbr(screen)).toHaveFocus();
    await expect
      .element(tooltip(screen))
      .toHaveTextContent("Marginal visual flight rules");
    await expect.element(tooltip(screen)).toBeVisible();
    expect(getComputedStyle(badge(screen))).toMatchObject({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  // A weather table would otherwise have one tab stop per row.
  test("is no tab stop unless focusable", async () => {
    const screen = await renderIn("light", FlightCategory, {
      category: "VFR",
    });
    expect(screen.container.querySelector("[tabindex]")).toBeNull();
  });

  test("names every category", () => {
    expect(FLIGHT_CATEGORIES).toEqual(["VFR", "MVFR", "IFR", "LIFR"]);
  });

  test("tints VFR, MVFR and IFR in their roles", async () => {
    for (const [category, tint] of tinted) {
      const screen = await renderIn("light", FlightCategory, { category });
      const style = getComputedStyle(badge(screen));
      expect(style.backgroundColor).toBe(translucent(role(tint, "light"), 15));
      expect(style.color).toBe(
        mixed(role(tint, "light"), role("foreground", "light"), 75),
      );
    }
  });

  test("fills LIFR solid destructive, its text in card", async () => {
    const screen = await renderIn("light", FlightCategory, {
      category: "LIFR",
    });
    expect(getComputedStyle(badge(screen))).toMatchObject({
      backgroundColor: role("destructive", "light"),
      color: role("card", "light"),
    });
  });

  test.each(SCHEMES)("is readable in every category in %s", async (scheme) => {
    for (const category of FLIGHT_CATEGORIES) {
      const screen = await renderIn(scheme, FlightCategory, { category });
      expectReadable(badge(screen), scheme);
    }
  });

  test("shows nothing for a category it doesn't know, and warns", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    onTestFinished(() => warn.mockRestore());
    const screen = await renderIn("light", FlightCategory, {
      category: "UNKN" as FlightCategoryCode,
    });
    expect(screen.container.textContent).toBe("");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"UNKN"'));
  });

  // class is for layout, so it goes on the outermost box.
  test("adds a caller's class to the box round the badge, and attributes to the badge", async () => {
    const screen = await renderIn("light", FlightCategory, {
      category: "VFR",
      class: "ml-4",
      id: "kind",
    });
    expect(badge(screen).id).toBe("kind");
    const box = badge(screen).parentElement!;
    expect(box).toContainElement(tooltip(screen).element() as HTMLElement);
    expect(getComputedStyle(box).marginLeft).toBe("16px");
  });
});
