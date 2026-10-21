import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { expectReadable } from "../../../test/contrast.ts";
import InCell from "../../../test/InCell.svelte";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Airport from "./Airport.svelte";

// An Airport rendered alone or in a table cell.
type Screen = RenderResult<typeof Airport> | RenderResult<typeof InCell>;

const kind = { code: "KIND", name: "Indianapolis International" };

// The text on screen, its spacing tidied.
const shown = (element: Element) =>
  element.textContent!.replace(/\s+/g, " ").trim();
const root = (screen: Screen) =>
  page.elementLocator(screen.container.firstElementChild!);
// An abbr has no role, so it is found by its tag.
const abbr = (screen: Screen) =>
  page.elementLocator(screen.container.querySelector("abbr")!);
// Hidden from screen readers, so found with includeHidden.
const tooltip = (screen: Screen) =>
  screen.getByRole("tooltip", { includeHidden: true });

describe("Airport", () => {
  describe("with its name inline (the default)", () => {
    test("shows the code, then the name", async () => {
      const screen = await renderIn("light", Airport, { airport: kind });
      expect(shown(screen.container)).toBe("KIND Indianapolis International");
      expect(screen.container.querySelector("[role=tooltip]")).toBeNull();
    });

    test("reads as the code and the name", async () => {
      const screen = await renderIn("light", InCell, {
        component: Airport,
        props: { airport: kind },
      });
      await expect
        .element(screen.getByRole("cell"))
        .toHaveAccessibleName("KIND Indianapolis International");
    });

    test("shows the code in mono", async () => {
      const screen = await renderIn("light", Airport, { airport: kind });
      const code = screen.getByText("KIND").element();
      expect(getComputedStyle(code).fontFamily).toMatch(/monospace/);
    });

    test("shows the name muted, readable", async () => {
      const screen = await renderIn("light", Airport, { airport: kind });
      const name = screen.getByText("Indianapolis International");
      await expect
        .element(name)
        .toHaveStyle({ color: role("muted-foreground", "light") });
      expectReadable(name.element(), "light");
    });

    test("adds a caller's class and attributes to its root", async () => {
      const screen = await renderIn("light", Airport, {
        airport: kind,
        class: "ml-4",
        id: "airport",
      });
      await expect.element(root(screen)).toHaveAttribute("id", "airport");
      await expect.element(root(screen)).toHaveStyle({ marginLeft: "16px" });
    });
  });

  test("shows the code alone when it has no name", async () => {
    for (const nameAt of ["inline", "tooltip"] as const) {
      const screen = await renderIn("light", Airport, {
        airport: { code: "KXMP" },
        nameAt,
        focusable: true,
      });
      expect(shown(screen.container)).toBe("KXMP");
      expect(screen.container.querySelector("[role=tooltip]")).toBeNull();
      expect(screen.container.querySelector("[tabindex]")).toBeNull();
      screen.unmount();
    }
  });

  // How the code, name and tooltip behave is AbbrTooltip.test.ts's.
  describe("with its name in a tooltip", () => {
    const tip = { airport: kind, nameAt: "tooltip" } as const;

    test("puts the code in an AbbrTooltip, the name in the tooltip", async () => {
      const screen = await renderIn("light", Airport, {
        ...tip,
        focusable: true,
      });
      await expect
        .element(abbr(screen))
        .toHaveTextContent("KIND Indianapolis International");

      await userEvent.tab();

      await expect.element(abbr(screen)).toHaveFocus();
      await expect
        .element(tooltip(screen))
        .toHaveTextContent("Indianapolis International");
      await expect.element(tooltip(screen)).toBeVisible();
    });

    // class is for layout, so it goes on the outermost box.
    test("adds a caller's class to the box round the code, and attributes to the abbr", async () => {
      const screen = await renderIn("light", Airport, {
        ...tip,
        class: "ml-4",
        id: "airport",
      });
      await expect.element(abbr(screen)).toHaveAttribute("id", "airport");
      const box = abbr(screen).element().parentElement!;
      expect(box).toContainElement(tooltip(screen).element() as HTMLElement);
      expect(getComputedStyle(box).marginLeft).toBe("16px");
    });
  });
});
