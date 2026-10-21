import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
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
  // The tick is inside the thumb, so it slides with it.
  test("moves its thumb and shows a tick on it when on", async () => {
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
    });
    const toggle = screen.getByRole("switch");
    const thumb = screen.container.querySelector<HTMLElement>(
      'span[aria-hidden="true"]',
    )!;
    const tick = thumb.querySelector("svg")!;
    const offLeft = thumb.getBoundingClientRect().left;
    // Drawn clear while off.
    await expect.element(tick).toHaveStyle({ fill: "rgba(0, 0, 0, 0)" });
    await toggle.click();
    await expect.element(tick).toHaveStyle({ fill: role("primary", "light") });
    await expect
      .poll(() => thumb.getBoundingClientRect().left - offLeft)
      .toBe(20);
  });

  // Off: a `muted` track edged in `input`, with a `muted-foreground`
  // thumb. On: a `primary` track with a `primary-foreground` thumb. The
  // label in `foreground-soft`.
  test.each(SCHEMES)(
    "colours the track, thumb and label in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Switch, {
        label: "Email me about events",
      });
      const toggle = screen.getByRole("switch");
      const thumb = screen.container.querySelector<HTMLElement>(
        'span[aria-hidden="true"]',
      )!;
      await expect.element(toggle).toHaveStyle({
        backgroundColor: role("muted", scheme),
        borderColor: role("input", scheme),
      });
      await expect.element(thumb).toHaveStyle({
        backgroundColor: role("muted-foreground", scheme),
      });
      await expect
        .element(screen.getByText("Email me about events"))
        .toHaveStyle({ color: role("foreground-soft", scheme) });

      await toggle.click();
      await expect.element(toggle).toHaveStyle({
        backgroundColor: role("primary", scheme),
        borderColor: role("primary", scheme),
      });
      await expect.element(thumb).toHaveStyle({
        backgroundColor: role("primary-foreground", scheme),
      });
    },
  );

  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Switch, {
        label: "Email me about events",
      });
      await userEvent.tab();
      await expect.element(screen.getByRole("switch")).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    },
  );

  test("is named by its label alone and described by its children", async () => {
    const screen = await renderIn("light", Switch, {
      label: "Email me about events",
      "aria-describedby": "elsewhere",
      children: text("About once a week"),
    });
    const toggle = screen.getByRole("switch", {
      name: "Email me about events",
    });
    await expect
      .element(toggle)
      .toHaveAttribute(
        "aria-describedby",
        expect.stringMatching(/^elsewhere \S+-hint$/),
      );
    await expect
      .element(toggle)
      .toHaveAccessibleDescription("About once a week");
    await screen.getByText("About once a week").click();
    await expect.element(toggle).toBeChecked();
  });

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
