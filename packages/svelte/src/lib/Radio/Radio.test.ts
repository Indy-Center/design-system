import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Radio from "./Radio.svelte";
import RadioGroup from "./Radio.test.svelte";

describe("Radio", () => {
  test("is a radio named by its label, checked when the group holds its value", async () => {
    const screen = await renderIn("light", Radio, {
      label: "Tower",
      name: "position",
      value: "twr",
      group: "twr",
    });
    await expect
      .element(screen.getByRole("radio", { name: "Tower" }))
      .toBeChecked();
  });

  test("is not checked when the group holds another value", async () => {
    const screen = await renderIn("light", Radio, {
      label: "Tower",
      name: "position",
      value: "twr",
      group: "gnd",
    });
    await expect
      .element(screen.getByRole("radio", { name: "Tower" }))
      .not.toBeChecked();
  });

  test("sets the group to its value when chosen", async () => {
    let group: string | undefined = "gnd";
    const screen = await renderIn("light", Radio, {
      label: "Tower",
      name: "position",
      value: "twr",
      get group() {
        return group;
      },
      set group(value) {
        group = value;
      },
    });
    await screen.getByText("Tower").click();
    await expect.element(screen.getByRole("radio")).toBeChecked();
    expect(group).toBe("twr");
  });

  test("in a group, Tab enters at the chosen radio and leaves after it", async () => {
    const screen = await renderIn("light", RadioGroup, { group: "twr" });
    await userEvent.tab();
    await expect
      .element(screen.getByRole("radio", { name: "Tower" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("button", { name: "Next" }))
      .toHaveFocus();
  });

  test("in a group, the arrow keys move to the next radio and choose it", async () => {
    let group: string | undefined = "gnd";
    const screen = await renderIn("light", RadioGroup, {
      get group() {
        return group;
      },
      set group(value) {
        group = value;
      },
    });
    const ground = screen.getByRole("radio", { name: "Ground" });
    const tower = screen.getByRole("radio", { name: "Tower" });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(tower).toHaveFocus();
    await expect.element(tower).toBeChecked();
    await expect.element(ground).not.toBeChecked();
    expect(group).toBe("twr");
    await userEvent.keyboard("{ArrowUp}");
    await expect.element(ground).toBeChecked();
    expect(group).toBe("gnd");
  });

  test("in a group with none chosen, Space chooses the focused radio", async () => {
    let group: string | undefined;
    const screen = await renderIn("light", RadioGroup, {
      get group() {
        return group;
      },
      set group(value) {
        group = value;
      },
    });
    const ground = screen.getByRole("radio", { name: "Ground" });
    await userEvent.tab();
    await expect.element(ground).toHaveFocus();
    await expect.element(ground).not.toBeChecked();
    await userEvent.keyboard(" ");
    await expect.element(ground).toBeChecked();
    expect(group).toBe("gnd");
  });

  // Unbound, each radio keeps its own copy of `group`. Svelte only writes
  // `checked` when that radio's copy changes, so the browser's choice holds,
  // and a new `group` from the parent still wins.
  test.each([undefined, "twr"])(
    "in a group that only reads group (%s), the last chosen stays checked",
    async (group) => {
      const screen = await renderIn("light", RadioGroup, {
        group,
        bound: false,
      });
      const radio = (name: string) => screen.getByRole("radio", { name });
      for (const name of ["Ground", "Tower", "Approach", "Ground"]) {
        await screen.getByText(name).click();
      }
      await expect.element(radio("Ground")).toBeChecked();
      await expect.element(radio("Tower")).not.toBeChecked();
      await expect.element(radio("Approach")).not.toBeChecked();
      await screen.rerender({ group: "app", bound: false });
      await expect.element(radio("Approach")).toBeChecked();
      await expect.element(radio("Ground")).not.toBeChecked();
      await screen.getByText("Tower").click();
      await expect.element(radio("Tower")).toBeChecked();
      await expect.element(radio("Approach")).not.toBeChecked();
    },
  );

  test("takes number values, and sets the group to the number", async () => {
    let group: number | undefined = 1;
    const screen = await renderIn("light", Radio<number>, {
      label: "Two",
      name: "seats",
      value: 2,
      get group() {
        return group;
      },
      set group(value) {
        group = value;
      },
    });
    const radio = screen.getByRole("radio", { name: "Two" });
    await expect.element(radio).toHaveAttribute("value", "2");
    await expect.element(radio).not.toBeChecked();
    await radio.click();
    expect(group).toBe(2);
  });

  test("in a group, the radios sit in a group named by the legend", async () => {
    const screen = await renderIn("light", RadioGroup, {});
    const group = screen.getByRole("group", { name: "Position" });
    await expect
      .element(group.getByRole("radio", { name: "Approach" }))
      .toBeInTheDocument();
  });

  // The guide's roles: `primary` circle (#0369A1 in both), `foreground-soft`
  // label (#334155 light, #D1D5DB dark). The circle is checked, so the
  // browser paints its fill from `accent-color`.
  test.each([
    ["light", "rgb(51, 65, 85)"],
    ["dark", "rgb(209, 213, 219)"],
    ["dark-header", "rgb(209, 213, 219)"],
  ] as const)("colours the circle and label in %s", async (scheme, label) => {
    const screen = await renderIn(scheme, Radio, {
      label: "Tower",
      name: "position",
      value: "twr",
      group: "twr",
    });
    const radio = screen.getByRole("radio");
    await expect.element(radio).toBeChecked();
    await expect
      .element(radio)
      .toHaveStyle({ accentColor: "rgb(3, 105, 161)" });
    await expect
      .element(screen.getByText("Tower"))
      .toHaveStyle({ color: label });
  });

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Radio, {
        label: "Tower",
        name: "position",
        value: "twr",
      });
      await userEvent.tab();
      await expect.element(screen.getByRole("radio")).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );

  test("is a row at least 44px tall", async () => {
    const screen = await renderIn("light", Radio, {
      label: "Tower",
      name: "position",
      value: "twr",
    });
    const row = screen.container.querySelector("label")!;
    expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  test("calls a caller's onchange and passes other attributes to the input", async () => {
    let changes = 0;
    const screen = await renderIn("light", Radio, {
      label: "Tower",
      name: "position",
      value: "twr",
      required: true,
      class: "mt-4",
      onchange: () => changes++,
    });
    const radio = screen.getByRole("radio");
    await expect.element(radio).toBeRequired();
    await radio.click();
    expect(changes).toBe(1);
    await expect
      .element(screen.container.querySelector("label")!)
      .toHaveStyle({ marginTop: "16px" });
  });
});
