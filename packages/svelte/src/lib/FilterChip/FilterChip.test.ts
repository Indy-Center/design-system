import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  expectReadable,
  SCHEMES,
  translucent,
} from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import FilterChip from "./FilterChip.svelte";

describe("FilterChip", () => {
  test("is a toggle button named by its text, off by default", async () => {
    const screen = await renderIn("light", FilterChip, {
      children: text("Online"),
    });
    const chip = screen.getByRole("button", { name: "Online" });
    await expect.element(chip).toHaveAttribute("type", "button");
    await expect.element(chip).toHaveAttribute("aria-pressed", "false");
  });

  test("flips its pressed state when clicked", async () => {
    const screen = await renderIn("light", FilterChip, {
      children: text("Online"),
    });
    const chip = screen.getByRole("button", { name: "Online" });
    await chip.click();
    await expect.element(chip).toHaveAttribute("aria-pressed", "true");
    await chip.click();
    await expect.element(chip).toHaveAttribute("aria-pressed", "false");
  });

  test("starts pressed when told to", async () => {
    const screen = await renderIn("light", FilterChip, {
      pressed: true,
      children: text("Waiting"),
    });
    await expect
      .element(screen.getByRole("button", { name: "Waiting" }))
      .toHaveAttribute("aria-pressed", "true");
  });

  test("says its count after its text, in its name", async () => {
    const screen = await renderIn("light", FilterChip, {
      count: 12,
      children: text("Waiting"),
    });
    await expect
      .element(screen.getByRole("button", { name: "Waiting (12)" }))
      .toBeVisible();
  });

  test("shows a count of nought", async () => {
    const screen = await renderIn("light", FilterChip, {
      count: 0,
      children: text("Waiting"),
    });
    await expect
      .element(screen.getByRole("button", { name: "Waiting (0)" }))
      .toBeVisible();
  });

  test("is reached by Tab and flipped by Space and Enter", async () => {
    const screen = await renderIn("light", FilterChip, {
      children: text("Online"),
    });
    await userEvent.tab();
    const chip = screen.getByRole("button", { name: "Online" });
    await expect.element(chip).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(chip).toHaveAttribute("aria-pressed", "true");
    await userEvent.keyboard("{Enter}");
    await expect.element(chip).toHaveAttribute("aria-pressed", "false");
  });

  test("runs a caller's onclick as well as flipping", async () => {
    let clicks = 0;
    const screen = await renderIn("light", FilterChip, {
      children: text("Online"),
      onclick: () => clicks++,
    });
    const chip = screen.getByRole("button");
    await chip.click();
    await expect.element(chip).toHaveAttribute("aria-pressed", "true");
    expect(clicks).toBe(1);
  });

  test("is dimmed when disabled, and takes no fill on hover", async () => {
    const screen = await renderIn("light", FilterChip, {
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
  test.each(SCHEMES)(
    "stays readable when hovered off in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, FilterChip, {
        children: text("Online"),
      });
      const chip = screen.getByRole("button");
      await userEvent.hover(chip);
      await expect.element(chip).toHaveStyle({
        backgroundColor: role("muted", scheme),
        color: role("foreground-soft", scheme),
      });
      expectReadable(chip.element(), scheme);
    },
  );

  // On: the guide's `primary` border on a 10% `primary` tint, as a checked
  // ChoiceCard, with `foreground` text.
  test.each(SCHEMES)("is tinted primary when on in %s", async (scheme) => {
    const screen = await renderIn(scheme, FilterChip, {
      pressed: true,
      children: text("Online"),
    });
    const chip = screen.getByRole("button");
    await expect.element(chip).toHaveStyle({
      borderColor: role("primary", scheme),
      backgroundColor: translucent(role("primary", scheme), 10),
      color: role("foreground", scheme),
    });
    expect(getComputedStyle(chip.element()).textDecorationLine).toBe("none");
    expectReadable(chip.element(), scheme);
  });

  // Off: an `input` border, no fill, `muted-foreground` text, struck
  // through, so off isn't told by colour alone.
  test.each(SCHEMES)("is struck through when off in %s", async (scheme) => {
    const screen = await renderIn(scheme, FilterChip, {
      children: text("Online"),
    });
    const chip = screen.getByRole("button");
    await expect.element(chip).toHaveStyle({
      borderColor: role("input", scheme),
      // No fill of its own.
      backgroundColor: "rgba(0, 0, 0, 0)",
      color: role("muted-foreground", scheme),
    });
    expect(getComputedStyle(chip.element()).textDecorationLine).toBe(
      "line-through",
    );
    expectReadable(chip.element(), scheme);
  });

  // The guide's `ring` role.
  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, FilterChip, {
        children: text("Online"),
      });
      await userEvent.tab();
      await expect.element(screen.getByRole("button")).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    },
  );

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
