import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { expectLeadingHiddenIcon } from "../../../test/snippets.ts";
import Description from "./Description.svelte";
import Part from "./formControl.test.svelte";

// The looks Input, Textarea, Select, Combobox, SearchInput and
// DateTimeInput share. Each of them keeps one test that it takes these.
describe("textControlClasses", () => {
  // The guide's roles: `muted` fill, `input` border, `foreground` text.
  test("takes the input roles", async () => {
    const screen = await renderIn("light", Part, { part: "text" });
    await expect.element(screen.getByRole("textbox")).toHaveStyle({
      backgroundColor: role("muted", "light"),
      borderColor: role("input", "light"),
      borderStyle: "solid",
      color: role("foreground", "light"),
    });
  });

  // The guide's `placeholder` role.
  test("colours its placeholder", async () => {
    const screen = await renderIn("light", Part, { part: "text" });
    const box = screen.getByRole("textbox").element();
    // toHaveStyle can't read a pseudo-element, so this reads ::placeholder.
    expect(getComputedStyle(box, "::placeholder").color).toBe(
      role("placeholder", "light"),
    );
  });

  // The guide's `destructive` role.
  test("has a destructive border when invalid", async () => {
    const screen = await renderIn("light", Part, {
      part: "text",
      invalid: true,
    });
    await expect
      .element(screen.getByRole("textbox"))
      .toHaveStyle({ borderColor: role("destructive", "light") });
  });

  // The guide's `ring` role.
  test("shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", Part, { part: "text" });
    await userEvent.tab();
    const box = screen.getByRole("textbox");
    await expect.element(box).toHaveFocus();
    await expect.element(box).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  test("dims when disabled", async () => {
    const screen = await renderIn("light", Part, {
      part: "text",
      disabled: true,
    });
    await expect
      .element(screen.getByRole("textbox"))
      .toHaveStyle({ opacity: "0.6", cursor: "not-allowed" });
  });

  test("is at least 44px tall", async () => {
    const screen = await renderIn("light", Part, { part: "text" });
    const box = screen.getByRole("textbox").element();
    expect(box.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });
});

// The row Checkbox, Radio and Switch share, and the box Checkbox and Radio
// share.
describe("choice classes", () => {
  // The guide's roles: `primary` box, `foreground-soft` label. The box is
  // ticked, so the browser paints its fill from `accent-color`.
  test("colours the box and the label", async () => {
    const screen = await renderIn("light", Part, { part: "choice" });
    await expect
      .element(screen.getByRole("checkbox"))
      .toHaveStyle({ accentColor: role("primary", "light") });
    await expect
      .element(screen.getByText("Visiting controller"))
      .toHaveStyle({ color: role("foreground-soft", "light") });
  });

  // The guide's `ring` role.
  test("shows a ring outline on the box when tabbed to", async () => {
    const screen = await renderIn("light", Part, { part: "choice" });
    await userEvent.tab();
    const box = screen.getByRole("checkbox");
    await expect.element(box).toHaveFocus();
    await expect.element(box).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  test("dims the row and its pointer when disabled", async () => {
    const screen = await renderIn("light", Part, {
      part: "choice",
      disabled: true,
    });
    const row = screen.container.querySelector("label")!;
    expect(getComputedStyle(row).opacity).toBe("0.6");
    expect(getComputedStyle(row).cursor).toBe("not-allowed");
    await expect
      .element(screen.getByRole("checkbox"))
      .toHaveStyle({ cursor: "not-allowed" });
  });

  test("is a row at least 44px tall", async () => {
    const screen = await renderIn("light", Part, { part: "choice" });
    const row = screen.container.querySelector("label")!;
    expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });
});

// The hint and error under Field, Fieldset, Checkbox and DateTimeInput.
describe("Description", () => {
  // The guide's roles: `muted-foreground` hint, `destructive` error.
  test("shows the hint and the error, coloured, at the ids describedBy names", async () => {
    const screen = await renderIn("light", Description, {
      id: "callsign",
      hint: "As you log on to VATSIM.",
      error: "Enter a callsign.",
    });
    const hint = screen.getByText("As you log on to VATSIM.");
    await expect.element(hint).toHaveAttribute("id", "callsign-hint");
    await expect
      .element(hint)
      .toHaveStyle({ color: role("muted-foreground", "light") });
    const error = document.getElementById("callsign-error")!;
    await expect.element(error).toHaveTextContent("Enter a callsign.");
    await expect
      .element(error)
      .toHaveStyle({ color: role("destructive", "light") });
  });

  // Not by colour alone: an icon before the error, hidden from readers.
  test("marks the error with a hidden icon before it", async () => {
    await renderIn("light", Description, {
      id: "callsign",
      error: "Enter a callsign.",
    });
    const error = document.getElementById("callsign-error")!;
    expectLeadingHiddenIcon(error, error.querySelector("svg")!);
  });

  test("renders nothing with neither hint nor error", async () => {
    const screen = await renderIn("light", Description, { id: "callsign" });
    expect(screen.container.childElementCount).toBe(0);
  });
});
