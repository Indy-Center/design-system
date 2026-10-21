import { describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Menu from "./DropdownMenu.test.svelte";

type Screen = RenderResult<typeof Menu>;

const arrow = (screen: Screen) =>
  screen.getByRole("button", { name: "More actions for Jo Rivera" });

describe("DropdownMenu", () => {
  test("is a button named by its label, closed to start", async () => {
    const screen = await renderIn("light", Menu, {});

    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect
      .element(screen.getByRole("button", { name: "Withdraw" }))
      .not.toBeInTheDocument();
  });

  test("Enter opens it, and Tab moves into its items", async () => {
    const screen = await renderIn("light", Menu, {});

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "true");
    await userEvent.tab();
    await expect
      .element(screen.getByRole("link", { name: "View profile" }))
      .toHaveFocus();
  });

  test("Enter on the open arrow closes it", async () => {
    const screen = await renderIn("light", Menu, {});

    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard("{Enter}");

    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect
      .element(screen.getByRole("button", { name: "Withdraw" }))
      .not.toBeInTheDocument();
  });

  test("Escape closes it and puts focus back on the arrow", async () => {
    const screen = await renderIn("light", Menu, {});
    await arrow(screen).click();
    await userEvent.tab();

    await userEvent.keyboard("{Escape}");

    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(arrow(screen)).toHaveFocus();
  });

  test("with a row's tooltip showing, Escape hides it first, then closes the menu", async () => {
    const screen = await renderIn("light", Menu, { tooltip: true });
    const tip = screen.getByRole("tooltip", { includeHidden: true });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    await expect.element(tip).toBeVisible();

    await userEvent.keyboard("{Escape}");

    await expect.element(tip).not.toBeVisible();
    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");

    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(arrow(screen)).toHaveFocus();
  });

  test("a click outside closes it", async () => {
    const screen = await renderIn("light", Menu, {});
    await arrow(screen).click();

    await screen.getByRole("button", { name: "Elsewhere" }).click();

    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
  });

  test("choosing a row runs it, closes the menu and puts focus back", async () => {
    const screen = await renderIn("light", Menu, {});
    await arrow(screen).click();

    await screen.getByRole("button", { name: "Withdraw" }).click();

    await expect
      .element(screen.getByTestId("withdrawn"))
      .toHaveTextContent("yes");
    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(arrow(screen)).toHaveFocus();
  });

  test("disabled, it looks it and doesn't open", async () => {
    const screen = await renderIn("light", Menu, { disabled: true });

    await expect.element(arrow(screen)).toBeDisabled();
    await expect.element(arrow(screen)).toHaveStyle({ opacity: "0.6" });
    await arrow(screen).click({ force: true });
    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
  });

  test("puts class on the arrow", async () => {
    const screen = await renderIn("light", Menu, { class: "ml-8" });

    await expect.element(arrow(screen)).toHaveClass("ml-8");
  });

  test("Tab past the last row closes it", async () => {
    const screen = await renderIn("light", Menu, {});
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");

    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("button", { name: "Remove" }))
      .toHaveFocus();
    await userEvent.tab();

    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect
      .element(screen.getByRole("button", { name: "Elsewhere" }))
      .toHaveFocus();
  });

  test("shows its words beside the arrow", async () => {
    const screen = await renderIn("light", Menu, { text: "Actions" });

    await expect.element(arrow(screen)).toHaveTextContent("Actions");
  });

  const boxes = (screen: Screen) => ({
    button: arrow(screen).element().getBoundingClientRect(),
    panel: screen
      .getByRole("button", { name: "Withdraw" })
      .element()
      .parentElement!.getBoundingClientRect(),
  });

  test("opens under the arrow, its right edge on the arrow's", async () => {
    const screen = await renderIn("light", Menu, { inset: true });
    await arrow(screen).click();

    const { button, panel } = boxes(screen);
    expect(panel.top).toBeGreaterThanOrEqual(button.bottom);
    expect(Math.round(panel.right)).toBe(Math.round(button.right));
  });

  test("at the window's left edge, opens rightwards to stay in it", async () => {
    const screen = await renderIn("light", Menu, {});
    await arrow(screen).click();

    const { button, panel } = boxes(screen);
    expect(panel.top).toBeGreaterThanOrEqual(button.bottom);
    expect(Math.round(panel.left)).toBe(Math.round(button.left));
  });

  test("every row is at least 44px tall", async () => {
    const screen = await renderIn("light", Menu, {});
    await arrow(screen).click();

    for (const name of ["Withdraw", "Remove"]) {
      const row = screen.getByRole("button", { name }).element();
      expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
    const link = screen.getByRole("link", { name: "View profile" }).element();
    expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  test.each(SCHEMES)("draws the panel on the card in %s", async (scheme) => {
    const screen = await renderIn(scheme, Menu, {});
    await arrow(screen).click();
    const row = screen.getByRole("button", { name: "Withdraw" });

    await expect
      .element(page.elementLocator(row.element().parentElement!))
      .toHaveStyle({
        backgroundColor: role("card", scheme),
        borderColor: role("border", scheme),
      });
    await expect
      .element(row)
      .toHaveStyle({ color: role("foreground", scheme) });
  });

  test.each(SCHEMES)("a secondary arrow is outlined in %s", async (scheme) => {
    const screen = await renderIn(scheme, Menu, {});

    await expect.element(arrow(screen)).toHaveStyle({
      color: role("foreground", scheme),
      borderColor: role("input", scheme),
    });
  });

  test.each(SCHEMES)(
    "a primary arrow attached to its button matches it in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Menu, {
        attached: true,
        variant: "primary",
      });
      const main = screen.getByRole("button", { name: "Approve" });

      await expect.element(arrow(screen)).toHaveStyle({
        backgroundColor: role("primary", scheme),
        color: role("primary-foreground", scheme),
        borderLeftColor: role("primary-hover", scheme),
      });
      // Flush: the arrow starts where the button ends.
      expect(
        Math.round(arrow(screen).element().getBoundingClientRect().left),
      ).toBe(Math.round(main.element().getBoundingClientRect().right));
    },
  );
});
