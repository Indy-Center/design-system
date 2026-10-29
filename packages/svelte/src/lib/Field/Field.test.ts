import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Field, { type FieldControl } from "./Field.svelte";

/** A control that spreads what Field hands it, as `<Input {...control} />` does. */
const control = () =>
  createRawSnippet((attrs: () => FieldControl) => ({
    render: () => {
      const html = Object.entries(attrs())
        .filter(([, value]) => value !== undefined)
        .map(([name, value]) =>
          value === true && !name.startsWith("aria-")
            ? name
            : `${name}="${value}"`,
        )
        .join(" ");
      return `<input ${html} />`;
    },
  }));

describe("Field", () => {
  test("names the control by its label", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      children: control(),
    });
    await expect
      .element(screen.getByRole("textbox", { name: "Callsign" }))
      .toBeInTheDocument();
  });

  test("keeps the control's name when the label is visually hidden", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      hideLabel: true,
      children: control(),
    });
    await expect
      .element(screen.getByRole("textbox", { name: "Callsign" }))
      .toBeVisible();
    const label = screen.container.querySelector("label")!;
    expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });

  test("describes the control with its hint", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      hint: "As you log on to VATSIM.",
      children: control(),
    });
    await expect
      .element(screen.getByRole("textbox", { name: "Callsign" }))
      .toHaveAccessibleDescription("As you log on to VATSIM.");
  });

  test("marks the control invalid and describes it with the hint and the error", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      hint: "As you log on to VATSIM.",
      error: "Enter a callsign.",
      children: control(),
    });
    const box = screen.getByRole("textbox", { name: "Callsign" });
    await expect.element(box).toBeInvalid();
    await expect.element(box).toHaveAttribute("aria-invalid", "true");
    await expect
      .element(box)
      .toHaveAccessibleDescription(
        "As you log on to VATSIM. Enter a callsign.",
      );
  });

  test("is not invalid and has no description with neither hint nor error", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      children: control(),
    });
    const box = screen.getByRole("textbox");
    await expect.element(box).not.toHaveAttribute("aria-invalid");
    await expect.element(box).not.toHaveAttribute("aria-describedby");
  });

  test("says required in words and makes the control required", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      required: true,
      children: control(),
    });
    await expect.element(screen.getByText("(required)")).toBeVisible();
    await expect
      .element(screen.getByRole("textbox", { name: "Callsign" }))
      .toBeRequired();
  });

  test("uses the caller's id for the control", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      id: "callsign",
      hint: "As you log on to VATSIM.",
      children: control(),
    });
    const box = screen.getByRole("textbox", { name: "Callsign" });
    await expect.element(box).toHaveAttribute("id", "callsign");
    await expect
      .element(box)
      .toHaveAccessibleDescription("As you log on to VATSIM.");
  });

  // The guide's roles: `foreground-soft` label, `muted-foreground`
  // "(required)". The hint's and error's are Description's, which
  // formControl's tests hold.
  test("colours the label and (required)", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      required: true,
      children: control(),
    });
    await expect
      .element(screen.container.querySelector("label")!)
      .toHaveStyle({ color: role("foreground-soft", "light") });
    await expect
      .element(screen.getByText("(required)"))
      .toHaveStyle({ color: role("muted-foreground", "light") });
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      class: "mt-4",
      "data-testid": "field",
      children: control(),
    });
    await expect
      .element(screen.getByTestId("field"))
      .toHaveStyle({ marginTop: "16px" });
  });
});
