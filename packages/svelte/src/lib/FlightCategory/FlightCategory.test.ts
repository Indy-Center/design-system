import { describe, expect, onTestFinished, test, vi } from "vitest";
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

const abbrOf = (container: Element) => container.querySelector("abbr")!;

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
// darkened (in light) or lightened (in dark) a quarter towards
// `foreground`: in the role alone it falls short of 4.5:1 on its tint.
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
  ] as const)(
    "shows %s, its long name in the abbr's title",
    async (code, name) => {
      const screen = await renderIn("light", FlightCategory, {
        category: code,
      });
      const abbr = abbrOf(screen.container);
      expect(abbr.textContent).toBe(code);
      expect(abbr.title).toBe(name);
    },
  );

  test("names every category", () => {
    expect(FLIGHT_CATEGORIES).toEqual(["VFR", "MVFR", "IFR", "LIFR"]);
  });

  test.each(["light", "dark"] as const)(
    "tints VFR, MVFR and IFR in their roles in %s",
    async (scheme) => {
      for (const [category, tint] of tinted) {
        const screen = await renderIn(scheme, FlightCategory, { category });
        const abbr = abbrOf(screen.container);
        expect(getComputedStyle(abbr).backgroundColor).toBe(
          translucent(role(tint, scheme), 15),
        );
        expect(getComputedStyle(abbr).color).toBe(
          mixed(role(tint, scheme), role("foreground", scheme), 75),
        );
      }
    },
  );

  test("fills LIFR solid destructive, its text in card", async () => {
    const screen = await renderIn("light", FlightCategory, {
      category: "LIFR",
    });
    await expect.element(abbrOf(screen.container)).toHaveStyle({
      backgroundColor: role("destructive", "light"),
      color: role("card", "light"),
    });
  });

  test.each(SCHEMES)("is readable in every category in %s", async (scheme) => {
    for (const category of FLIGHT_CATEGORIES) {
      const screen = await renderIn(scheme, FlightCategory, { category });
      expectReadable(abbrOf(screen.container), scheme);
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

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", FlightCategory, {
      category: "VFR",
      class: "ml-4",
      id: "kind",
    });
    const abbr = abbrOf(screen.container);
    await expect.element(abbr).toHaveAttribute("id", "kind");
    await expect.element(abbr).toHaveStyle({ marginLeft: "16px" });
  });
});
