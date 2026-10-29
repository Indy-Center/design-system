import { describe, expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import ChoiceCard from "./ChoiceCard.svelte";
import Cards from "./ChoiceCard.test.svelte";

/** The card labelled `name`: in a Fieldset, the option holding that text. */
function cardOf(
  screen: { getByText(text: string, options: { exact: boolean }): Locator },
  name: string,
) {
  return screen
    .getByText(name, { exact: true })
    .element()
    .closest<HTMLElement>("fieldset > div > *")!;
}

describe("ChoiceCard", () => {
  test.each([
    {
      type: "radio",
      legend: "Certification",
      name: "Tower",
      about: "Local control at a towered field",
    },
    {
      type: "checkbox",
      legend: "Emails",
      name: "Events",
      about: "Group flights and fly-ins",
    },
  ] as const)(
    "as $type, each is named by its label alone and described by its children, in a group named by the legend",
    async ({ type, legend, name, about }) => {
      const screen = await renderIn("light", Cards, { type });
      const group = screen.getByRole("group", { name: legend });
      await expect
        .element(group.getByRole(type, { name }))
        .toHaveAccessibleDescription(about);
    },
  );

  test("as radios, announces the chosen one as checked, and a click anywhere on a card, even its corner, sets the group", async () => {
    let group: string | undefined = "twr";
    const screen = await renderIn("light", Cards, {
      type: "radio",
      get group() {
        return group;
      },
      set group(value) {
        group = value;
      },
    });
    const tower = screen.getByRole("radio", { name: "Tower" });
    const approach = screen.getByRole("radio", { name: "Approach" });
    await expect.element(tower).toBeChecked();
    await userEvent.click(cardOf(screen, "Approach"), {
      position: { x: 3, y: 3 },
    });
    await expect.element(approach).toBeChecked();
    await expect.element(tower).not.toBeChecked();
    expect(group).toBe("app");
  });

  test("as checkboxes, a click anywhere on a card, even its corner, ticks it, and checked binds both ways", async () => {
    let events = false;
    const screen = await renderIn("light", Cards, {
      type: "checkbox",
      get events() {
        return events;
      },
      set events(value) {
        events = value;
      },
    });
    const box = screen.getByRole("checkbox", { name: "Events" });
    await userEvent.click(cardOf(screen, "Events"), {
      position: { x: 3, y: 3 },
    });
    await expect.element(box).toBeChecked();
    expect(events).toBe(true);
    await box.click();
    await expect.element(box).not.toBeChecked();
    expect(events).toBe(false);
  });

  // Unchosen: edged in `border`, with no fill (transparent), so the page
  // shows through. Chosen: edged in `primary` over a 10% wash of it. The
  // label in `foreground-soft`, the children in `muted-foreground`, the
  // box in `primary`. A Checkbox card is drawn the same way.
  test("colours the card, label and children, and highlights it when chosen", async () => {
    const screen = await renderIn("light", Cards, { type: "radio" });
    const card = cardOf(screen, "Tower");
    await expect.element(card).toHaveStyle({
      borderTopColor: role("border", "light"),
      borderTopWidth: "1px",
      backgroundColor: "rgba(0, 0, 0, 0)",
    });
    await expect
      .element(screen.getByText("Tower", { exact: true }))
      .toHaveStyle({ color: role("foreground-soft", "light") });
    await expect
      .element(screen.getByText("Local control at a towered field"))
      .toHaveStyle({ color: role("muted-foreground", "light") });

    const input = screen.getByRole("radio", { name: "Tower" });
    await input.click();
    await expect.element(card).toHaveStyle({
      borderTopColor: role("primary", "light"),
      backgroundColor: translucent(role("primary", "light"), 10),
    });
    await expect
      .element(input)
      .toHaveStyle({ accentColor: role("primary", "light") });
  });

  test.each(["radio", "checkbox"] as const)(
    "as %s, passes disabled, aria-* and onchange to its input, and dims the whole card",
    async (type) => {
      let changes = 0;
      const shared = {
        label: "Events",
        disabled: false,
        "aria-describedby": "elsewhere",
        onchange: () => changes++,
      };
      const screen = await renderIn(
        "light",
        ChoiceCard,
        type === "radio"
          ? { ...shared, type, name: "emails", value: "events" }
          : { ...shared, type },
      );
      const input = screen.getByRole(type, { name: "Events" });
      await expect
        .element(input)
        .toHaveAttribute(
          "aria-describedby",
          expect.stringContaining("elsewhere"),
        );
      await input.click();
      expect(changes).toBe(1);

      await screen.rerender({ disabled: true });
      await expect.element(input).toBeDisabled();
      const card = screen.container.firstElementChild as HTMLElement;
      await expect.element(card).toHaveStyle({ opacity: "0.6" });
      await expect
        .element(card.querySelector("label")!)
        .toHaveStyle({ opacity: "1" });
    },
  );

  test("keeps a gap between stacked cards", async () => {
    const screen = await renderIn("light", Cards, { type: "radio" });
    const tower = cardOf(screen, "Tower").getBoundingClientRect();
    const approach = cardOf(screen, "Approach").getBoundingClientRect();
    expect(approach.top - tower.bottom).toBe(12);
  });

  test("is at least 44px tall, with a caller's class on the card", async () => {
    const screen = await renderIn("light", ChoiceCard, {
      type: "checkbox",
      label: "Events",
      name: "emails",
      class: "mt-4",
    });
    const card = screen.container.firstElementChild as HTMLElement;
    expect(card.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    await expect.element(card).toHaveStyle({ marginTop: "16px" });
    await expect
      .element(screen.getByRole("checkbox", { name: "Events" }))
      .toHaveAttribute("name", "emails");
  });
});
