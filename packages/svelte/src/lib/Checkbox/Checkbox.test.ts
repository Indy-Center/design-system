import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import Checkbox from "./Checkbox.svelte";

describe("Checkbox", () => {
  test("is a checkbox named by its label, neither invalid nor described with no error", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
    });
    const box = screen.getByRole("checkbox", { name: "Visiting controller" });
    await expect.element(box).not.toBeChecked();
    await expect.element(box).not.toHaveAttribute("aria-invalid");
    await expect.element(box).not.toHaveAttribute("aria-describedby");
  });

  test("toggles with Space when tabbed to", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
    });
    const box = screen.getByRole("checkbox", { name: "Visiting controller" });
    await userEvent.tab();
    await expect.element(box).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(box).toBeChecked();
    await userEvent.keyboard(" ");
    await expect.element(box).not.toBeChecked();
  });

  test("toggles from a click on its label", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
    });
    await screen.getByText("Visiting controller").click();
    await expect
      .element(screen.getByRole("checkbox", { name: "Visiting controller" }))
      .toBeChecked();
  });

  test("binds checked both ways", async () => {
    let checked = true;
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
      get checked() {
        return checked;
      },
      set checked(value) {
        checked = value;
      },
    });
    const box = screen.getByRole("checkbox", { name: "Visiting controller" });
    await expect.element(box).toBeChecked();
    await box.click();
    expect(checked).toBe(false);
  });

  test("shows its own error, and is invalid and described by it", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "I've read the policy",
      error: "Tick this to send the form.",
      "aria-describedby": "policy-link",
    });
    const box = screen.getByRole("checkbox", { name: "I've read the policy" });
    await expect.element(box).toHaveAttribute("aria-invalid", "true");
    await expect
      .element(screen.getByText("Tick this to send the form."))
      .toBeVisible();
    // The caller's id comes first, then the error's.
    const ids = box.element().getAttribute("aria-describedby")!.split(" ");
    expect(ids[0]).toBe("policy-link");
    expect(document.getElementById(ids[1])).toHaveTextContent(
      "Tick this to send the form.",
    );
  });

  test("is named by its label alone and described by its children", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
      error: "Untick this.",
      children: text("Home facility elsewhere"),
    });
    const box = screen.getByRole("checkbox", { name: "Visiting controller" });
    await expect
      .element(box)
      .toHaveAccessibleDescription("Home facility elsewhere Untick this.");
    await screen.getByText("Home facility elsewhere").click();
    await expect.element(box).toBeChecked();
  });

  // The choice classes and Description, whose looks (ring and 44px row
  // too) formControl's tests hold: a `primary` box, a `foreground-soft`
  // label, a `destructive` error.
  test("takes the choice and error colours", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
      checked: true,
      error: "Untick this.",
    });
    await expect
      .element(screen.getByRole("checkbox"))
      .toHaveStyle({ accentColor: role("primary", "light") });
    await expect
      .element(screen.getByText("Untick this."))
      .toHaveStyle({ color: role("destructive", "light") });
    await expect
      .element(screen.getByText("Visiting controller"))
      .toHaveStyle({ color: role("foreground-soft", "light") });
  });

  test("puts a caller's class on its outer element and attributes on the box", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
      name: "visiting",
      value: "yes",
      class: "mt-4",
    });
    const box = screen.getByRole("checkbox");
    await expect.element(box).toHaveAttribute("name", "visiting");
    await expect.element(box).toHaveAttribute("value", "yes");
    await expect
      .element(screen.container.firstElementChild as HTMLElement)
      .toHaveStyle({ marginTop: "16px" });
  });
});
