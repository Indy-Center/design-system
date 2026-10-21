import { mdiEarth } from "@mdi/js";
import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import ChoiceRow from "./ChoiceRow.svelte";
import WhatsSaved from "./WhatsSaved.svelte";

describe("ChoiceRow", () => {
  test("is a toggle named by its choice, described by its detail", async () => {
    const screen = await renderIn("light", ChoiceRow, {
      pressed: true,
      icon: mdiEarth,
      children: text("Use my device's time zone"),
      detail: text("Indianapolis (EDT)"),
    });
    const row = screen.getByRole("button", {
      name: "Use my device's time zone",
      exact: true,
    });
    await expect.element(row).toHaveAttribute("aria-pressed", "true");
    await expect.element(row).toHaveAccessibleDescription("Indianapolis (EDT)");
  });

  test("the choice in use stands out in the muted fill", async () => {
    const screen = await renderIn("light", ChoiceRow, {
      pressed: true,
      icon: mdiEarth,
      children: text("Zulu"),
    });
    await expect.element(screen.getByRole("button")).toHaveStyle({
      color: role("foreground", "light"),
      backgroundColor: role("muted", "light"),
    });
  });

  test("a choice not in use is in the soft foreground", async () => {
    const screen = await renderIn("light", ChoiceRow, {
      pressed: false,
      icon: mdiEarth,
      children: text("Zulu"),
    });
    const row = screen.getByRole("button");
    await expect.element(row).toHaveAttribute("aria-pressed", "false");
    await expect
      .element(row)
      .toHaveStyle({ color: role("foreground-soft", "light") });
  });

  test("is at least 44px tall", async () => {
    const screen = await renderIn("light", ChoiceRow, {
      pressed: false,
      icon: mdiEarth,
      children: text("Zulu"),
    });
    const box = screen.getByRole("button").element().getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});

describe("WhatsSaved", () => {
  const note = "Saved on this browser for a year, across flyindycenter.com.";

  test("shows its note when asked What's saved?", async () => {
    const screen = await renderIn("light", WhatsSaved, { note });
    const button = screen.getByRole("button", { name: "What's saved?" });
    await expect.element(button).toHaveAttribute("aria-expanded", "false");
    await expect.element(screen.getByText(note)).not.toBeVisible();
    await button.click();
    await expect.element(button).toHaveAttribute("aria-expanded", "true");
    await expect.element(screen.getByText(note)).toBeVisible();
  });

  test("its button is at least 44px tall", async () => {
    const screen = await renderIn("light", WhatsSaved, { note });
    const box = screen
      .getByRole("button", { name: "What's saved?" })
      .element()
      .getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });
});
