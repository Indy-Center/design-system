import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Fieldset from "./Fieldset.svelte";
import Options from "./Fieldset.test.svelte";

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

  test("keeps a caller's aria-describedby before its own hint", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Position",
      hint: "The one you'll train on first.",
      "aria-describedby": "intro",
      children: options,
    });
    const ids = screen
      .getByRole("group")
      .element()
      .getAttribute("aria-describedby")!
      .split(" ");
    expect(ids[0]).toBe("intro");
    expect(document.getElementById(ids[1])).toHaveTextContent(
      "The one you'll train on first.",
    );
  });

  test.each(["checkbox", "switch"] as const)(
    "with an error, marks its %ses invalid",
    async (options) => {
      const screen = await renderIn("light", Options, {
        options,
        error: "Choose at least one.",
      });
      for (const name of ["Ground", "Tower"]) {
        await expect
          .element(screen.getByRole(options, { name }))
          .toHaveAttribute("aria-invalid", "true");
      }
    },
  );

  test.each(["checkbox", "switch"] as const)(
    "with no error, leaves its %ses valid",
    async (options) => {
      const screen = await renderIn("light", Options, { options });
      await expect
        .element(screen.getByRole(options, { name: "Ground" }))
        .not.toHaveAttribute("aria-invalid");
    },
  );

  test("when required, makes its radios required but not its checkboxes", async () => {
    const radios = await renderIn("light", Options, {
      options: "radio",
      required: true,
    });
    for (const name of ["Ground", "Tower"]) {
      await expect.element(radios.getByRole("radio", { name })).toBeRequired();
    }
    const boxes = await renderIn("light", Options, {
      options: "checkbox",
      required: true,
    });
    await expect
      .element(boxes.getByRole("checkbox", { name: "Ground" }))
      .not.toBeRequired();
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

  // A checkbox group can't carry `required` on its boxes, so the legend says it.
  test("says required in words in the legend, read in the group's name", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Emails",
      required: true,
      children: options,
    });
    await expect.element(screen.getByText("(required)")).toBeVisible();
    await expect
      .element(screen.getByRole("group", { name: "Emails (required)" }))
      .toBeInTheDocument();
  });

  // The guide's roles: `foreground-soft` legend, `muted-foreground` hint,
  // `destructive` error.
  test.each(SCHEMES)(
    "colours the legend, hint and error in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Fieldset, {
        legend: "Position",
        hint: "The one you'll train on first.",
        error: "Choose a position.",
        children: options,
      });
      await expect
        .element(screen.container.querySelector("legend")!)
        .toHaveStyle({ color: role("foreground-soft", scheme) });
      await expect
        .element(screen.getByText("The one you'll train on first."))
        .toHaveStyle({ color: role("muted-foreground", scheme) });
      await expect
        .element(screen.getByText("Choose a position."))
        .toHaveStyle({ color: role("destructive", scheme) });
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
