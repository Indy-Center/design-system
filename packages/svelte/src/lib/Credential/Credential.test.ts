import { describe, expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import {
  expectReadable,
  SCHEMES,
  styleOfClasses,
  translucent,
} from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Credential from "./Credential.svelte";
import InCell from "./Credential.test.svelte";

// A Credential rendered alone or in a table cell.
type Screen = RenderResult<typeof Credential> | RenderResult<typeof InCell>;

// An abbr has no role, so it is found by its tag.
const abbr = (screen: Screen) =>
  page.elementLocator(screen.container.querySelector("abbr")!);
const chip = (screen: Screen) =>
  page.elementLocator(abbr(screen).element().parentElement!);
// What the chip shows after the abbr, its spacing tidied.
const afterCode = (screen: Screen) =>
  (abbr(screen).element().nextElementSibling?.textContent ?? "")
    .replace(/\s+/g, " ")
    .trim();
// Hidden from screen readers, so found with includeHidden.
const tooltip = (screen: Screen) =>
  screen.getByRole("tooltip", { includeHidden: true });

const sGc = {
  code: "S-GC",
  name: "Simple Ground Control",
  kind: "certification",
} as const;
const sLc = {
  code: "S-LC",
  name: "Simple Local Control",
  kind: "endorsement",
} as const;
const appSolo = {
  code: "APP-SOLO",
  name: "Approach solo",
  kind: "solo",
  until: "2026-11-03",
} as const;

describe("Credential", () => {
  test("is a mono chip holding the code in an abbr", async () => {
    const screen = await renderIn("light", Credential, sGc);
    expect(abbr(screen).element().firstChild!.textContent).toBe("S-GC");
    expect(chip(screen).element().tagName).toBe("SPAN");
    expect(getComputedStyle(chip(screen).element()).fontFamily).toMatch(
      /monospace/,
    );
  });

  // As Rating: some screen readers said the long name twice, and the
  // browser's own tooltip would show beside the chip's.
  test("gives the abbr no title", async () => {
    const screen = await renderIn("light", Credential, sGc);
    await expect.element(abbr(screen)).not.toHaveAttribute("title");
  });

  test("reads as the code and the long name, once", async () => {
    const screen = await renderIn("light", InCell, sGc);
    await expect
      .element(screen.getByRole("cell"))
      .toHaveAccessibleName("S-GC Simple Ground Control");
  });

  // A roster column would otherwise have a tab stop per credential.
  test("is no tab stop unless focusable", async () => {
    const screen = await renderIn("light", Credential, sGc);
    expect(screen.container.querySelector("[tabindex]")).toBeNull();

    await userEvent.tab();

    await expect.element(abbr(screen)).not.toHaveFocus();
  });

  test("shows the long name in a tooltip on hover", async () => {
    const screen = await renderIn("light", Credential, sGc);
    await expect.element(tooltip(screen)).not.toBeVisible();

    await chip(screen).hover();

    await expect.element(tooltip(screen)).toBeVisible();
    await expect
      .element(tooltip(screen))
      .toHaveTextContent("Simple Ground Control");
  });

  test("shows the tooltip on keyboard focus, when focusable", async () => {
    const screen = await renderIn("light", Credential, {
      ...sGc,
      focusable: true,
    });

    await userEvent.tab();

    await expect.element(abbr(screen)).toHaveFocus();
    await expect.element(tooltip(screen)).toBeVisible();
  });

  // The hidden text says it, so neither the tooltip nor a description
  // repeats it.
  test("reads the long name once while the tooltip shows", async () => {
    const screen = await renderIn("light", InCell, {
      ...sGc,
      focusable: true,
    });
    await userEvent.tab();
    await expect.element(tooltip(screen)).toBeVisible();

    await expect
      .element(screen.getByRole("cell"))
      .toHaveAccessibleName("S-GC Simple Ground Control");
    await expect.element(abbr(screen)).not.toHaveAccessibleDescription();
  });

  describe("a solo", () => {
    test("shows its expiry after the code, day before month", async () => {
      const screen = await renderIn("light", Credential, appSolo);
      expect(afterCode(screen)).toBe("· until 3 Nov");
    });

    test("reads as the code, the long name and the expiry", async () => {
      const screen = await renderIn("light", InCell, appSolo);
      await expect
        .element(screen.getByRole("cell"))
        .toHaveAccessibleName("APP-SOLO Approach solo until 3 Nov");
    });

    test("marks the expiry up as a date", async () => {
      const screen = await renderIn("light", Credential, appSolo);
      const time = screen.container.querySelector("time")!;
      expect(time.getAttribute("datetime")).toBe("2026-11-03");
      expect(time.textContent).toBe("3 Nov");
    });

    // VATUSA's dates are Zulu: an instant late on the 3rd in the US is
    // already the 4th.
    test("takes the date from an instant in Zulu", async () => {
      const screen = await renderIn("light", Credential, {
        ...appSolo,
        until: new Date("2026-11-04T02:00:00Z"),
      });
      expect(afterCode(screen)).toBe("· until 4 Nov");
    });

    test("leaves out an expiry that isn't a date, and warns", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      onTestFinished(() => warn.mockRestore());
      const screen = await renderIn("light", Credential, {
        ...appSolo,
        until: "soon",
      });
      expect(afterCode(screen)).toBe("");
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"soon"'));
    });

    test("shows no expiry when given none", async () => {
      const screen = await renderIn("light", Credential, {
        ...appSolo,
        until: undefined,
      });
      expect(afterCode(screen)).toBe("");
    });

    test("shows its expiry without a long name too", async () => {
      const screen = await renderIn("light", Credential, {
        ...appSolo,
        name: undefined,
      });
      const plain = screen.container.firstElementChild!;
      expect(plain.textContent!.replace(/\s+/g, " ").trim()).toBe(
        "APP-SOLO · until 3 Nov",
      );
    });
  });

  describe.each(SCHEMES)("in %s", (scheme) => {
    // Chip's certification variant, the same in every scheme.
    test("a certification is white on emerald-700, readable", async () => {
      const screen = await renderIn(scheme, Credential, sGc);
      await expect.element(chip(screen)).toHaveStyle({
        color: role("white", scheme),
        backgroundColor: styleOfClasses(
          "bg-emerald-700",
          chip(screen).element(),
        ).backgroundColor,
      });
      expectReadable(chip(screen).element(), scheme);
    });

    test("an endorsement is foreground on an info tint, readable", async () => {
      const screen = await renderIn(scheme, Credential, sLc);
      await expect.element(chip(screen)).toHaveStyle({
        color: role("foreground", scheme),
        backgroundColor: translucent(role("info", scheme), 20),
      });
      expectReadable(chip(screen).element(), scheme);
    });

    test("a solo is foreground on a warning tint, readable", async () => {
      const screen = await renderIn(scheme, Credential, appSolo);
      await expect.element(chip(screen)).toHaveStyle({
        color: role("foreground", scheme),
        backgroundColor: translucent(role("warning", scheme), 20),
      });
      expectReadable(chip(screen).element(), scheme);
    });

    // The guide's `ring` role, round the chip though the abbr has focus.
    test("shows a ring around the chip on keyboard focus", async () => {
      const screen = await renderIn(scheme, Credential, {
        ...sLc,
        focusable: true,
      });
      await userEvent.tab();
      await expect.element(chip(screen)).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    });

    // Tooltip's own look: inverted, so it stands off whatever it covers.
    test("shows the long name in background on foreground", async () => {
      const screen = await renderIn(scheme, Credential, sLc);
      await chip(screen).hover();
      await expect.element(tooltip(screen)).toHaveStyle({
        backgroundColor: role("foreground", scheme),
        color: role("background", scheme),
      });
    });
  });

  test("shows the code alone, plain, when given no long name", async () => {
    const screen = await renderIn("light", Credential, {
      code: "IND_APP",
      kind: "certification",
      focusable: true,
    });
    await expect.element(screen.getByText("IND_APP")).toBeVisible();
    expect(screen.container.querySelector("abbr")).toBeNull();
    expect(screen.container.querySelector("[tabindex]")).toBeNull();
    expect(screen.container.querySelector("[role=tooltip]")).toBeNull();
  });

  // class is for layout, so it goes on the outermost box.
  test("adds a caller's class to the box round the chip, and attributes to the chip", async () => {
    const screen = await renderIn("light", Credential, {
      ...sGc,
      class: "ml-4",
      id: "credential",
    });
    await expect.element(chip(screen)).toHaveAttribute("id", "credential");
    const box = chip(screen).element().parentElement!;
    expect(box).toContainElement(tooltip(screen).element() as HTMLElement);
    expect(getComputedStyle(box).marginLeft).toBe("16px");
  });

  test("adds a caller's class and attributes to a plain chip", async () => {
    const screen = await renderIn("light", Credential, {
      code: "IND_APP",
      kind: "certification",
      class: "ml-4",
      id: "credential",
    });
    const plain = screen.getByText("IND_APP");
    await expect.element(plain).toHaveAttribute("id", "credential");
    await expect.element(plain).toHaveStyle({ marginLeft: "16px" });
  });
});
