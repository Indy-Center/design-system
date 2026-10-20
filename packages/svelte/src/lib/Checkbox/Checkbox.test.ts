import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Checkbox from "./Checkbox.svelte";

describe("Checkbox", () => {
  test("is a checkbox named by its label", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
    });
    await expect
      .element(screen.getByRole("checkbox", { name: "Visiting controller" }))
      .not.toBeChecked();
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

  test("is neither invalid nor described with no error", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
    });
    const box = screen.getByRole("checkbox");
    await expect.element(box).not.toHaveAttribute("aria-invalid");
    await expect.element(box).not.toHaveAttribute("aria-describedby");
  });

  // The guide's roles: `primary` box (#0369A1 in both), `foreground-soft`
  // label (#334155 light, #D1D5DB dark), `destructive` error (#B91C1C
  // light, #F87171 dark). The box is ticked, so the browser paints its fill
  // from `accent-color`.
  test.each([
    ["light", "rgb(51, 65, 85)", "rgb(185, 28, 28)"],
    ["dark", "rgb(209, 213, 219)", "rgb(248, 113, 113)"],
    ["dark-header", "rgb(209, 213, 219)", "rgb(248, 113, 113)"],
  ] as const)(
    "colours the box, label and error in %s",
    async (scheme, label, error) => {
      const screen = await renderIn(scheme, Checkbox, {
        label: "Visiting controller",
        checked: true,
        error: "Untick this.",
      });
      const box = screen.getByRole("checkbox");
      await expect.element(box).toBeChecked();
      await expect
        .element(box)
        .toHaveStyle({ accentColor: "rgb(3, 105, 161)" });
      await expect
        .element(screen.getByText("Untick this."))
        .toHaveStyle({ color: error });
      await expect
        .element(screen.getByText("Visiting controller"))
        .toHaveStyle({ color: label });
    },
  );

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Checkbox, {
        label: "Visiting controller",
      });
      await userEvent.tab();
      await expect.element(screen.getByRole("checkbox")).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );

  test("is a row at least 44px tall", async () => {
    const screen = await renderIn("light", Checkbox, {
      label: "Visiting controller",
    });
    const row = screen.container.querySelector("label")!;
    expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
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
