import { describe, expect, onTestFinished, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { translucent } from "../../../test/contrast.ts";
import InCell from "../../../test/InCell.svelte";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Credential from "./Credential.svelte";

// Each kind's colour is Chip.test.ts's; how the code, long name and
// tooltip behave is AbbrTooltip.test.ts's.

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
  // The kind picks Chip's variant; the guide's `ring` goes round the chip.
  test("is its kind's chip with the code in an AbbrTooltip, its long name in the tooltip", async () => {
    const screen = await renderIn("light", Credential, {
      ...sLc,
      focusable: true,
    });
    await expect
      .element(abbr(screen))
      .toHaveTextContent("S-LC Simple Local Control");
    await expect.element(chip(screen)).toHaveStyle({
      backgroundColor: translucent(role("info", "light"), 20),
    });

    await userEvent.tab();

    await expect.element(abbr(screen)).toHaveFocus();
    await expect
      .element(tooltip(screen))
      .toHaveTextContent("Simple Local Control");
    await expect.element(tooltip(screen)).toBeVisible();
    await expect.element(chip(screen)).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  // A roster column would otherwise have a tab stop per credential.
  test("is no tab stop unless focusable", async () => {
    const screen = await renderIn("light", Credential, sGc);
    expect(screen.container.querySelector("[tabindex]")).toBeNull();
  });

  describe("a solo", () => {
    test("shows its expiry after the code, day before month", async () => {
      const screen = await renderIn("light", Credential, appSolo);
      expect(afterCode(screen)).toBe("· until 3 Nov");
    });

    test("reads as the code, the long name and the expiry", async () => {
      const screen = await renderIn("light", InCell, {
        component: Credential,
        props: appSolo,
      });
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
