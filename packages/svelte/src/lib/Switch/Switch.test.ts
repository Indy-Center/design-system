import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Switch from "./Switch.svelte";

describe("Switch", () => {
  test("is a switch named by its label, off by default", async () => {
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
    });
    await expect
      .element(screen.getByRole("switch", { name: "Email me about events" }))
      .not.toBeChecked();
  });

  test("is announced as on when checked", async () => {
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
      checked: true,
    });
    await expect
      .element(screen.getByRole("switch", { name: "Email me about events" }))
      .toBeChecked();
  });

  test("flips with Space when tabbed to", async () => {
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
    });
    const toggle = screen.getByRole("switch", {
      name: "Email me about events",
    });
    await userEvent.tab();
    await expect.element(toggle).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(toggle).toBeChecked();
    await userEvent.keyboard(" ");
    await expect.element(toggle).not.toBeChecked();
  });

  test("flips from a click on its label, and binds checked both ways", async () => {
    let checked = false;
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
      get checked() {
        return checked;
      },
      set checked(value) {
        checked = value;
      },
    });
    await screen.getByText("Email me about events").click();
    await expect.element(screen.getByRole("switch")).toBeChecked();
    expect(checked).toBe(true);
  });

  // More than colour: the thumb moves across, and a tick shows when on.
  test("moves its thumb and shows a tick when on", async () => {
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
    });
    const toggle = screen.getByRole("switch");
    const thumb = screen.container.querySelector<HTMLElement>(
      'span[aria-hidden="true"]',
    )!;
    const tick = screen.container.querySelector<SVGElement>(
      'svg[aria-hidden="true"]',
    )!;
    const offLeft = thumb.getBoundingClientRect().left;
    await expect.element(tick).not.toBeVisible();
    await toggle.click();
    await expect.element(tick).toBeVisible();
    await expect
      .poll(() => thumb.getBoundingClientRect().left - offLeft)
      .toBe(20);
  });

  // The guide's roles. Off: a `muted` track (#E2E8F0 light, #334155 dark)
  // edged in `input` (#64748B in both), with a `muted-foreground` thumb
  // (#475569 light, #9CA3AF dark). On: a `primary` track (#0369A1) with a
  // `primary-foreground` thumb (#FFFFFF). The label in `foreground-soft`
  // (#334155 light, #D1D5DB dark).
  test.each([
    ["light", "rgb(226, 232, 240)", "rgb(71, 85, 105)", "rgb(51, 65, 85)"],
    ["dark", "rgb(51, 65, 85)", "rgb(156, 163, 175)", "rgb(209, 213, 219)"],
    [
      "dark-header",
      "rgb(51, 65, 85)",
      "rgb(156, 163, 175)",
      "rgb(209, 213, 219)",
    ],
  ] as const)(
    "colours the track, thumb and label in %s",
    async (scheme, track, thumbOff, label) => {
      const screen = await renderIn(scheme, Switch, {
        label: "Email me about events",
      });
      const toggle = screen.getByRole("switch");
      const thumb = screen.container.querySelector<HTMLElement>(
        'span[aria-hidden="true"]',
      )!;
      await expect.element(toggle).toHaveStyle({
        backgroundColor: track,
        borderColor: "rgb(100, 116, 139)",
      });
      await expect.element(thumb).toHaveStyle({ backgroundColor: thumbOff });
      await expect
        .element(screen.getByText("Email me about events"))
        .toHaveStyle({ color: label });

      await toggle.click();
      await expect.element(toggle).toHaveStyle({
        backgroundColor: "rgb(3, 105, 161)",
        borderColor: "rgb(3, 105, 161)",
      });
      await expect
        .element(thumb)
        .toHaveStyle({ backgroundColor: "rgb(255, 255, 255)" });
    },
  );

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Switch, {
        label: "Email me about events",
      });
      await userEvent.tab();
      await expect.element(screen.getByRole("switch")).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );

  test("is a row at least 44px tall", async () => {
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
    });
    const row = screen.container.querySelector("label")!;
    expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  test("puts a caller's class on the row and attributes on the input", async () => {
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
      name: "events",
      disabled: true,
      class: "mt-4",
    });
    const toggle = screen.getByRole("switch");
    await expect.element(toggle).toHaveAttribute("name", "events");
    await expect.element(toggle).toBeDisabled();
    await expect
      .element(screen.container.querySelector("label")!)
      .toHaveStyle({ marginTop: "16px" });
  });
});
