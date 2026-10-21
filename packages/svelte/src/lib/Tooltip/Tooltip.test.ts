import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Described from "./Tooltip.test.svelte";

type Screen = RenderResult<typeof Described>;

const trigger = (screen: Screen) =>
  screen.getByRole("button", { name: "Copy" });
// Found shown or hidden, so a test can check which.
const tooltip = (screen: Screen) =>
  screen.getByRole("tooltip", { includeHidden: true });

describe("Tooltip", () => {
  test("its text is the trigger's description, shown or not", async () => {
    const screen = await renderIn("light", Described, {});

    await expect
      .element(trigger(screen))
      .toHaveAccessibleDescription("Copies the CID to the clipboard");
    await expect.element(tooltip(screen)).not.toBeVisible();
  });

  test("shows while the trigger has focus, and hides when focus leaves", async () => {
    const screen = await renderIn("light", Described, {});

    await userEvent.tab();
    await expect.element(tooltip(screen)).toBeVisible();
    await expect
      .element(tooltip(screen))
      .toHaveTextContent("Copies the CID to the clipboard");

    await userEvent.tab();
    await expect.element(tooltip(screen)).not.toBeVisible();
  });

  test("shows while the pointer is on the trigger, and hides once it leaves", async () => {
    const screen = await renderIn("light", Described, {});

    await trigger(screen).hover();
    await expect.element(tooltip(screen)).toBeVisible();

    await trigger(screen).unhover();
    await expect.element(tooltip(screen)).not.toBeVisible();
  });

  // A click focuses the button, but not visibly: once the pointer leaves,
  // the tooltip goes, rather than staying until focus moves.
  test("hides when the pointer leaves a trigger it clicked", async () => {
    const screen = await renderIn("light", Described, {});

    await trigger(screen).click();
    await expect.element(tooltip(screen)).toBeVisible();
    await trigger(screen).unhover();

    await expect.element(trigger(screen)).toHaveFocus();
    await expect.element(tooltip(screen)).not.toBeVisible();
  });

  test("Escape on hover, then leaving and coming back, shows it again", async () => {
    const screen = await renderIn("light", Described, {});
    await trigger(screen).hover();
    await userEvent.keyboard("{Escape}");
    await expect.element(tooltip(screen)).not.toBeVisible();

    await trigger(screen).unhover();
    await trigger(screen).hover();

    await expect.element(tooltip(screen)).toBeVisible();
  });

  test("puts class on the box round the trigger, and other attributes on the tooltip", async () => {
    const screen = await renderIn("light", Described, {
      class: "ml-8",
      lang: "en-GB",
    });

    expect(trigger(screen).element().parentElement).toHaveClass("ml-8");
    await expect.element(tooltip(screen)).toHaveAttribute("lang", "en-GB");
  });

  // WCAG 1.4.13: the pointer can move onto the tooltip to read it.
  test("stays while the pointer moves onto the tooltip", async () => {
    const screen = await renderIn("light", Described, {});

    await trigger(screen).hover();
    await tooltip(screen).hover();

    await expect.element(tooltip(screen)).toBeVisible();
  });

  test("Escape hides it and leaves focus on the trigger", async () => {
    const screen = await renderIn("light", Described, {});
    await userEvent.tab();
    await expect.element(tooltip(screen)).toBeVisible();

    await userEvent.keyboard("{Escape}");

    await expect.element(tooltip(screen)).not.toBeVisible();
    await expect.element(trigger(screen)).toHaveFocus();
  });

  test("Escape hides a tooltip shown by hover, leaving focus where it is", async () => {
    const screen = await renderIn("light", Described, {});
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    elsewhere.element().focus();
    await trigger(screen).hover();
    await expect.element(tooltip(screen)).toBeVisible();

    await userEvent.keyboard("{Escape}");

    await expect.element(tooltip(screen)).not.toBeVisible();
    await expect.element(elsewhere).toHaveFocus();
  });

  test("shows again on the next focus after Escape", async () => {
    const screen = await renderIn("light", Described, {});
    await userEvent.tab();
    await userEvent.keyboard("{Escape}");

    await userEvent.tab();
    await userEvent.tab({ shift: true });

    await expect.element(tooltip(screen)).toBeVisible();
  });

  test("shows above the trigger", async () => {
    const screen = await renderIn("light", Described, {});
    await userEvent.tab();
    await expect.element(tooltip(screen)).toBeVisible();

    const button = trigger(screen).element().getBoundingClientRect();
    const tip = tooltip(screen).element().getBoundingClientRect();
    expect(tip.bottom).toBeLessThanOrEqual(button.top);
  });

  test.each(SCHEMES)(
    "is drawn in the page's text colour, its words in the background's, in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Described, {});
      await userEvent.tab();

      await expect.element(tooltip(screen)).toHaveStyle({
        backgroundColor: role("foreground", scheme),
        color: role("background", scheme),
      });
    },
  );
});
