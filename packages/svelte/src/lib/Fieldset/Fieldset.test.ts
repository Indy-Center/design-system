import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Fieldset from "./Fieldset.svelte";

const options = createRawSnippet(() => ({
  render: () =>
    `<div><label><input type="radio" name="position" value="twr" /> Tower</label></div>`,
}));

describe("Fieldset", () => {
  test("is a group named by its legend", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Position",
      children: options,
    });
    await expect
      .element(screen.getByRole("group", { name: "Position" }))
      .toContainElement(screen.getByRole("radio", { name: "Tower" }).element());
  });

  test("describes the group with its hint and its error", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Position",
      hint: "The one you'll train on first.",
      error: "Choose a position.",
      children: options,
    });
    await expect
      .element(screen.getByRole("group", { name: "Position" }))
      .toHaveAccessibleDescription(
        "The one you'll train on first. Choose a position.",
      );
  });

  test("has no description with neither hint nor error", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Position",
      children: options,
    });
    await expect
      .element(screen.getByRole("group"))
      .not.toHaveAttribute("aria-describedby");
  });

  test("gives each fieldset its own ids", async () => {
    await renderIn("light", Fieldset, {
      legend: "First",
      hint: "First hint.",
      children: options,
    });
    await renderIn("light", Fieldset, {
      legend: "Second",
      hint: "Second hint.",
      children: options,
    });
    await expect
      .element(page.getByRole("group", { name: "First" }))
      .toHaveAccessibleDescription("First hint.");
    await expect
      .element(page.getByRole("group", { name: "Second" }))
      .toHaveAccessibleDescription("Second hint.");
  });

  test("says required in words in the legend", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Position",
      required: true,
      children: options,
    });
    await expect.element(screen.getByText("(required)")).toBeVisible();
  });

  // The guide's roles: `foreground-soft` legend (#334155 light, #D1D5DB
  // dark), `muted-foreground` hint (#475569 light, #9CA3AF dark),
  // `destructive` error (#B91C1C light, #F87171 dark).
  test.each([
    ["light", "rgb(51, 65, 85)", "rgb(71, 85, 105)", "rgb(185, 28, 28)"],
    ["dark", "rgb(209, 213, 219)", "rgb(156, 163, 175)", "rgb(248, 113, 113)"],
    [
      "dark-header",
      "rgb(209, 213, 219)",
      "rgb(156, 163, 175)",
      "rgb(248, 113, 113)",
    ],
  ] as const)(
    "colours the legend, hint and error in %s",
    async (scheme, legend, hint, error) => {
      const screen = await renderIn(scheme, Fieldset, {
        legend: "Position",
        hint: "The one you'll train on first.",
        error: "Choose a position.",
        children: options,
      });
      await expect
        .element(screen.container.querySelector("legend")!)
        .toHaveStyle({ color: legend });
      await expect
        .element(screen.getByText("The one you'll train on first."))
        .toHaveStyle({ color: hint });
      await expect
        .element(screen.getByText("Choose a position."))
        .toHaveStyle({ color: error });
    },
  );

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Position",
      class: "mt-4",
      disabled: true,
      children: options,
    });
    const group = screen.getByRole("group");
    await expect.element(group).toHaveStyle({ marginTop: "16px" });
    await expect.element(screen.getByRole("radio")).toBeDisabled();
  });
});
