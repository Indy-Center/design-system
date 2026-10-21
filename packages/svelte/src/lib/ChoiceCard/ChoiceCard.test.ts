import { describe, expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
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
  test("as radios, each is named by its label alone and described by its children, in a group named by the legend", async () => {
    const screen = await renderIn("light", Cards, { type: "radio" });
    const group = screen.getByRole("group", { name: "Certification" });
    const tower = group.getByRole("radio", { name: "Tower" });
    await expect
      .element(tower)
      .toHaveAccessibleDescription("Local control at a towered field");
    await expect
      .element(group.getByRole("radio", { name: "None" }))
      .toBeInTheDocument();
  });

  test("as radios, announces the chosen one as checked, and the arrow keys move and choose", async () => {
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
    await userEvent.tab();
    await expect.element(tower).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(approach).toBeChecked();
    await expect.element(tower).not.toBeChecked();
    expect(group).toBe("app");
  });

  test("as radios, Space chooses the focused card when none is chosen", async () => {
    const screen = await renderIn("light", Cards, { type: "radio" });
    const tower = screen.getByRole("radio", { name: "Tower" });
    await userEvent.tab();
    await expect.element(tower).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(tower).toBeChecked();
  });

  test("as checkboxes, Space toggles, and checked binds both ways", async () => {
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
    await expect
      .element(box)
      .toHaveAccessibleDescription("Group flights and fly-ins");
    await userEvent.tab();
    await expect.element(box).toHaveFocus();
    await userEvent.keyboard(" ");
    await expect.element(box).toBeChecked();
    expect(events).toBe(true);
    await userEvent.keyboard(" ");
    await expect.element(box).not.toBeChecked();
    expect(events).toBe(false);
  });

  test("as checkboxes, a Fieldset's error marks them invalid", async () => {
    const screen = await renderIn("light", Cards, {
      type: "checkbox",
      error: "Pick at least one.",
    });
    await expect
      .element(screen.getByRole("checkbox", { name: "Training" }))
      .toHaveAttribute("aria-invalid", "true");
  });

  test.each(["radio", "checkbox"] as const)(
    "as %s, a click anywhere on the card picks it, even its corner",
    async (type) => {
      const screen = await renderIn("light", Cards, { type });
      const name = type === "radio" ? "Approach" : "Events";
      const card = cardOf(screen, name);
      await userEvent.click(card, { position: { x: 3, y: 3 } });
      await expect.element(screen.getByRole(type, { name })).toBeChecked();
    },
  );

  // The guide's roles. Unchosen: edged in `border` (#E2E8F0 light, #334155
  // dark). Chosen: edged in `primary` (#0369A1 in both) over a wash of it.
  // The label in `foreground-soft` (#334155 light, #D1D5DB dark), the
  // children in `muted-foreground` (#475569 light, #9CA3AF dark).
  test.each([
    ["light", "rgb(226, 232, 240)", "rgb(51, 65, 85)", "rgb(71, 85, 105)"],
    ["dark", "rgb(51, 65, 85)", "rgb(209, 213, 219)", "rgb(156, 163, 175)"],
    [
      "dark-header",
      "rgb(51, 65, 85)",
      "rgb(209, 213, 219)",
      "rgb(156, 163, 175)",
    ],
  ] as const)(
    "colours the card, label and children in %s, and highlights it when chosen",
    async (scheme, border, label, children) => {
      const screen = await renderIn(scheme, Cards, { type: "radio" });
      const card = cardOf(screen, "Tower");
      await expect
        .element(card)
        .toHaveStyle({ borderTopColor: border, borderTopWidth: "1px" });
      expect(getComputedStyle(card).backgroundColor).toBe("rgba(0, 0, 0, 0)");
      await expect
        .element(screen.getByText("Tower"))
        .toHaveStyle({ color: label });
      await expect
        .element(screen.getByText("Local control at a towered field"))
        .toHaveStyle({ color: children });

      await screen.getByRole("radio", { name: "Tower" }).click();
      await expect
        .element(card)
        .toHaveStyle({ borderTopColor: "rgb(3, 105, 161)" });
      // A wash of primary, so the page shows through.
      expect(getComputedStyle(card).backgroundColor).toMatch(/\/ 0\.1\)$/);
      await expect
        .element(screen.getByRole("radio", { name: "Tower" }))
        .toHaveStyle({ accentColor: "rgb(3, 105, 161)" });
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
