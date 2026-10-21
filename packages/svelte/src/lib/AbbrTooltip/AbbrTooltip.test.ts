import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import InCell from "./AbbrTooltip.test.svelte";

type Screen = RenderResult<typeof InCell>;

const c1 = { code: "C1", name: "Enroute Controller" };

// An abbr has no role, so it is found by its tag.
const abbr = (screen: Screen) =>
  page.elementLocator(screen.container.querySelector("abbr")!);
// Hidden from screen readers, so found with includeHidden.
const tooltip = (screen: Screen) =>
  screen.getByRole("tooltip", { includeHidden: true });

describe("AbbrTooltip", () => {
  // A title made some screen readers say the long name twice, and the
  // browser's own tooltip would show beside ours.
  test("shows the code in a mono abbr, with no title or underline", async () => {
    const screen = await renderIn("light", InCell, c1);
    expect(abbr(screen).element().firstChild!.textContent).toBe("C1");
    await expect.element(abbr(screen)).not.toHaveAttribute("title");
    await expect
      .element(abbr(screen))
      .toHaveStyle({ textDecorationLine: "none" });
    expect(getComputedStyle(abbr(screen).element()).fontFamily).toMatch(
      /monospace/,
    );
  });

  // A roster column would otherwise have one tab stop per row.
  test("is no tab stop unless focusable", async () => {
    const screen = await renderIn("light", InCell, c1);
    expect(screen.container.querySelector("[tabindex]")).toBeNull();

    await userEvent.tab();

    await expect.element(abbr(screen)).not.toHaveFocus();
  });

  test("shows the long name in a tooltip on hover", async () => {
    const screen = await renderIn("light", InCell, c1);
    await expect.element(tooltip(screen)).not.toBeVisible();

    await abbr(screen).hover();

    await expect.element(tooltip(screen)).toBeVisible();
    await expect
      .element(tooltip(screen))
      .toHaveTextContent("Enroute Controller");
  });

  test("shows the tooltip on keyboard focus, when focusable", async () => {
    const screen = await renderIn("light", InCell, { ...c1, focusable: true });

    await userEvent.tab();

    await expect.element(abbr(screen)).toHaveFocus();
    await expect.element(tooltip(screen)).toBeVisible();
  });

  // The hidden text says it, so neither the tooltip nor a description
  // repeats it.
  test("reads as the code and the long name once, with the tooltip showing too", async () => {
    const screen = await renderIn("light", InCell, { ...c1, focusable: true });
    const cell = screen.getByRole("cell");
    await expect.element(cell).toHaveAccessibleName("C1 Enroute Controller");

    await userEvent.tab();
    await expect.element(tooltip(screen)).toBeVisible();

    await expect.element(cell).toHaveAccessibleName("C1 Enroute Controller");
    await expect.element(abbr(screen)).not.toHaveAccessibleDescription();
  });

  // The guide's `ring` role.
  test("shows a ring round the abbr on keyboard focus", async () => {
    const screen = await renderIn("light", InCell, { ...c1, focusable: true });
    await userEvent.tab();
    await expect.element(abbr(screen)).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  describe("in a frame", () => {
    // The focus lands on the abbr, but the ring goes round the frame.
    test("puts the ring on the frame, not the abbr", async () => {
      const screen = await renderIn("light", InCell, {
        ...c1,
        focusable: true,
        framed: true,
      });
      await userEvent.tab();
      await expect.element(abbr(screen)).toHaveFocus();
      await expect.element(abbr(screen)).toHaveStyle({ outlineStyle: "none" });
      await expect.element(screen.getByTestId("frame")).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", "light"),
      });
    });

    test("gives the frame no ring unless focusable", async () => {
      const screen = await renderIn("light", InCell, { ...c1, framed: true });
      await expect
        .element(screen.getByTestId("frame"))
        .not.toHaveAttribute("class");
    });
  });

  // Tooltip's own look; this checks AbbrTooltip shows that Tooltip.
  test("shows the long name in background on foreground", async () => {
    const screen = await renderIn("light", InCell, c1);
    await abbr(screen).hover();
    await expect.element(tooltip(screen)).toHaveStyle({
      backgroundColor: role("foreground", "light"),
      color: role("background", "light"),
    });
  });

  // class is for layout, so it goes on the box round the abbr and tooltip.
  test("adds a caller's class to the box round it, and attributes to the abbr", async () => {
    const screen = await renderIn("light", InCell, {
      ...c1,
      class: "ml-4",
      id: "code",
    });
    await expect.element(abbr(screen)).toHaveAttribute("id", "code");
    const box = abbr(screen).element().parentElement!;
    expect(box).toContainElement(tooltip(screen).element() as HTMLElement);
    expect(getComputedStyle(box).marginLeft).toBe("16px");
  });
});
