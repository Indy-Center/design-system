import { describe, expect, test } from "vitest";
import { userEvent, type Locator } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
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

  // Unchosen: edged in `border`. Chosen: edged in `primary` over a wash of
  // it. The label in `foreground-soft`, the children in `muted-foreground`.
  const cases = [
    { type: "radio", name: "Tower", about: "Local control at a towered field" },
    { type: "checkbox", name: "Events", about: "Group flights and fly-ins" },
  ] as const;
  describe.each(cases)("as $type", ({ type, name, about }) => {
    test.each(SCHEMES)(
      "colours the card, label and children in %s, and highlights it when chosen",
      async (scheme) => {
        const screen = await renderIn(scheme, Cards, { type });
        const card = cardOf(screen, name);
        await expect.element(card).toHaveStyle({
          borderTopColor: role("border", scheme),
          borderTopWidth: "1px",
        });
        // Transparent: the page shows through until it's chosen.
        expect(getComputedStyle(card).backgroundColor).toBe("rgba(0, 0, 0, 0)");
        await expect
          .element(screen.getByText(name, { exact: true }))
          .toHaveStyle({ color: role("foreground-soft", scheme) });
        await expect
          .element(screen.getByText(about))
          .toHaveStyle({ color: role("muted-foreground", scheme) });

        const input = screen.getByRole(type, { name });
        await input.click();
        await expect
          .element(card)
          .toHaveStyle({ borderTopColor: role("primary", scheme) });
        // A wash of primary, so the page shows through.
        expect(getComputedStyle(card).backgroundColor).toMatch(/\/ 0\.1\)$/);
        await expect
          .element(input)
          .toHaveStyle({ accentColor: role("primary", scheme) });
      },
    );
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
