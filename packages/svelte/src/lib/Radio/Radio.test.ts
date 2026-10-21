import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
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

  test("is named by its label alone and described by its children", async () => {
    const screen = await renderIn("light", Radio, {
      label: "Tower",
      name: "position",
      value: "twr",
      "aria-describedby": "tower-note",
      children: text("Local control at a towered field"),
    });
    const radio = screen.getByRole("radio", { name: "Tower" });
    // The caller's id comes first, then the children's.
    const ids = radio.element().getAttribute("aria-describedby")!.split(" ");
    expect(ids[0]).toBe("tower-note");
    expect(document.getElementById(ids[1])).toHaveTextContent(
      "Local control at a towered field",
    );
    await screen.getByText("Local control at a towered field").click();
    await expect.element(radio).toBeChecked();
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

  // The browser moves the choice; this is that the radios, each its own
  // component, keep the bound group in step.
  test("in a group, the arrow keys move to the next radio and set the group", async () => {
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

  // The choice classes, whose looks (ring and 44px row too) formControl's
  // tests hold: a `primary` circle, a `foreground-soft` label.
  test("takes the choice colours", async () => {
    const screen = await renderIn("light", Radio, {
      label: "Tower",
      name: "position",
      value: "twr",
      group: "twr",
    });
    await expect
      .element(screen.getByRole("radio"))
      .toHaveStyle({ accentColor: role("primary", "light") });
    await expect
      .element(screen.getByText("Tower"))
      .toHaveStyle({ color: role("foreground-soft", "light") });
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
