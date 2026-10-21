import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Field, { type FieldControl } from "./Field.svelte";

/** A control that spreads what Field hands it, as `<Input {...control} />` does. */
const control = (tag: "input" | "textarea" = "input") =>
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
      return tag === "input"
        ? `<input ${html} />`
        : `<textarea ${html}></textarea>`;
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

  test("gives each field its own id", async () => {
    await renderIn("light", Field, { label: "First", children: control() });
    await renderIn("light", Field, { label: "Second", children: control() });
    const first = page.getByRole("textbox", { name: "First" }).element();
    const second = page.getByRole("textbox", { name: "Second" }).element();
    expect(first.id).not.toBe("");
    expect(first.id).not.toBe(second.id);
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

  test("wires any control, such as a textarea", async () => {
    const screen = await renderIn("light", Field, {
      label: "Comments",
      error: "Tell us what went well.",
      children: control("textarea"),
    });
    const box = screen.getByRole("textbox", { name: "Comments" });
    await expect.element(box).toHaveProperty("tagName", "TEXTAREA");
    await expect
      .element(box)
      .toHaveAccessibleDescription("Tell us what went well.");
  });

  test("focuses the control from its label", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      children: control(),
    });
    await screen.getByText("Callsign").click();
    await expect
      .element(screen.getByRole("textbox", { name: "Callsign" }))
      .toHaveFocus();
  });

  test("leaves the control reachable by Tab", async () => {
    const screen = await renderIn("light", Field, {
      label: "Callsign",
      hint: "As you log on to VATSIM.",
      children: control(),
    });
    await userEvent.tab();
    await expect
      .element(screen.getByRole("textbox", { name: "Callsign" }))
      .toHaveFocus();
  });

  // The guide's roles: `muted-foreground` hint, `destructive` error.
  test.each(SCHEMES)("colours the hint and the error in %s", async (scheme) => {
    const screen = await renderIn(scheme, Field, {
      label: "Callsign",
      hint: "As you log on to VATSIM.",
      error: "Enter a callsign.",
      children: control(),
    });
    await expect
      .element(screen.getByText("As you log on to VATSIM."))
      .toHaveStyle({ color: role("muted-foreground", scheme) });
    await expect
      .element(screen.getByText("Enter a callsign."))
      .toHaveStyle({ color: role("destructive", scheme) });
  });

  // The guide's roles: `foreground-soft` label, `muted-foreground`
  // "(required)".
  test.each(SCHEMES)(
    "colours the label and (required) in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Field, {
        label: "Callsign",
        required: true,
        children: control(),
      });
      await expect
        .element(screen.container.querySelector("label")!)
        .toHaveStyle({ color: role("foreground-soft", scheme) });
      await expect
        .element(screen.getByText("(required)"))
        .toHaveStyle({ color: role("muted-foreground", scheme) });
    },
  );

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
