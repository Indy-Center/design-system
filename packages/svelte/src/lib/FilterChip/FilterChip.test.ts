import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  expectBorderVisible,
  expectReadable,
  translucent,
} from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import FilterChip from "./FilterChip.svelte";

describe("FilterChip", () => {
  test.each([
    [undefined, "true"],
    [false, "false"],
  ])(
    "given pressed=%s, is a toggle button named by its text, pressed %s",
    async (pressed, state) => {
      const screen = await renderIn("light", FilterChip, {
        pressed,
        children: text("Online"),
      });
      const chip = screen.getByRole("button", { name: "Online" });
      await expect.element(chip).toHaveAttribute("type", "button");
      await expect.element(chip).toHaveAttribute("aria-pressed", state);
    },
  );

  test("says its count after its text, in its name, nought too", async () => {
    const screen = await renderIn("light", FilterChip, {
      count: 12,
      children: text("Waiting"),
    });
    await expect
      .element(screen.getByRole("button", { name: "Waiting (12)" }))
      .toBeVisible();
    await screen.rerender({ count: 0 });
    await expect
      .element(screen.getByRole("button", { name: "Waiting (0)" }))
      .toBeVisible();
  });

  test("flips its pressed state when clicked, and runs a caller's onclick too", async () => {
    let clicks = 0;
    const screen = await renderIn("light", FilterChip, {
      children: text("Online"),
      onclick: () => clicks++,
    });
    const chip = screen.getByRole("button");
    await chip.click();
    await expect.element(chip).toHaveAttribute("aria-pressed", "false");
    await chip.click();
    await expect.element(chip).toHaveAttribute("aria-pressed", "true");
    expect(clicks).toBe(2);
  });

  test("binds pressed both ways", async () => {
    let pressed = false;
    const screen = await renderIn("light", FilterChip, {
      children: text("Online"),
      get pressed() {
        return pressed;
      },
      set pressed(value) {
        pressed = value;
      },
    });
    const chip = screen.getByRole("button");
    await expect.element(chip).toHaveAttribute("aria-pressed", "false");
    await chip.click();
    expect(pressed).toBe(true);
  });

  test("is dimmed when disabled, and takes no fill on hover", async () => {
    const screen = await renderIn("light", FilterChip, {
      pressed: false,
      disabled: true,
      children: text("Online"),
    });
    const chip = screen.getByRole("button", { name: "Online" });
    await expect.element(chip).toBeDisabled();
    await userEvent.hover(chip, { force: true });
    await expect.element(chip).toHaveStyle({
      opacity: "0.6",
      // No fill of its own.
      backgroundColor: "rgba(0, 0, 0, 0)",
    });
  });

  // Off and hovered: a `muted` fill, with the text lifted to
  // `foreground-soft` to stay readable on it.
  test("stays readable when hovered off", async () => {
    const screen = await renderIn("light", FilterChip, {
      pressed: false,
      children: text("Online"),
    });
    const chip = screen.getByRole("button");
    await userEvent.hover(chip);
    await expect.element(chip).toHaveStyle({
      backgroundColor: role("muted", "light"),
      color: role("foreground-soft", "light"),
    });
    expectReadable(chip.element(), "light");
  });

  // On: the guide's `ring` border, 3:1 on the page and a card, on a 20%
  // `primary` tint, with `foreground` text. The border is `ring` rather
  // than `primary` for dark, where `primary` is faint, so dark is checked
  // too.
  test.each(["light", "dark"] as const)(
    "is tinted primary when on in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, FilterChip, {
        children: text("Online"),
      });
      const chip = screen.getByRole("button");
      await expect.element(chip).toHaveStyle({
        borderColor: role("ring", scheme),
        backgroundColor: translucent(role("primary", scheme), 20),
        color: role("foreground", scheme),
      });
      expect(getComputedStyle(chip.element()).textDecorationLine).toBe("none");
      expectReadable(chip.element(), scheme);
      expectBorderVisible(chip.element(), scheme);
    },
  );

  // Off: an `input` border, no fill, `muted-foreground` text, struck
  // through, so off isn't told by colour alone.
  test("is struck through when off", async () => {
    const screen = await renderIn("light", FilterChip, {
      pressed: false,
      children: text("Online"),
    });
    const chip = screen.getByRole("button");
    await expect.element(chip).toHaveStyle({
      borderColor: role("input", "light"),
      // No fill of its own.
      backgroundColor: "rgba(0, 0, 0, 0)",
      color: role("muted-foreground", "light"),
    });
    expect(getComputedStyle(chip.element()).textDecorationLine).toBe(
      "line-through",
    );
    expectReadable(chip.element(), "light");
  });

  // The guide's `ring` role.
  test("shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", FilterChip, {
      children: text("Online"),
    });
    await userEvent.tab();
    await expect.element(screen.getByRole("button")).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  test("is at least 44px tall and wide", async () => {
    const screen = await renderIn("light", FilterChip, {
      children: text("C1"),
    });
    const box = screen.getByRole("button").element().getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", FilterChip, {
      pressed: false,
      class: "ml-auto",
      "aria-controls": "roster",
      children: text("Online"),
    });
    const chip = screen.getByRole("button");
    await expect.element(chip).toHaveAttribute("aria-controls", "roster");
    await expect
      .element(chip)
      .toHaveStyle({ borderColor: role("input", "light") });
    expect(chip.element().classList.contains("ml-auto")).toBe(true);
  });
});
