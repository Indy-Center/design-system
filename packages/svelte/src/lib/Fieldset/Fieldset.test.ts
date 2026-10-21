import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
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

  // The order of the ids is describedBy's, in formControl's tests.
  test("describes the group with its hint and its error, after a caller's ids", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Position",
      hint: "The one you'll train on first.",
      error: "Choose a position.",
      "aria-describedby": "intro",
      children: options,
    });
    const group = screen.getByRole("group", { name: "Position" });
    await expect
      .element(group)
      .toHaveAccessibleDescription(
        "The one you'll train on first. Choose a position.",
      );
    await expect
      .element(group)
      .toHaveAttribute("aria-describedby", expect.stringMatching(/^intro /));
  });

  test.each(["checkbox", "switch"] as const)(
    "leaves its %ses valid with no error, and marks them invalid with one",
    async (options) => {
      const screen = await renderIn("light", Options, { options });
      await expect
        .element(screen.getByRole(options, { name: "Ground" }))
        .not.toHaveAttribute("aria-invalid");
      await screen.rerender({ options, error: "Choose at least one." });
      for (const name of ["Ground", "Tower"]) {
        await expect
          .element(screen.getByRole(options, { name }))
          .toHaveAttribute("aria-invalid", "true");
      }
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

  // The guide's `foreground-soft` legend. The hint's and error's colours
  // are Description's, which formControl's tests hold.
  test("colours the legend", async () => {
    const screen = await renderIn("light", Fieldset, {
      legend: "Position",
      children: options,
    });
    await expect
      .element(screen.container.querySelector("legend")!)
      .toHaveStyle({ color: role("foreground-soft", "light") });
  });

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
