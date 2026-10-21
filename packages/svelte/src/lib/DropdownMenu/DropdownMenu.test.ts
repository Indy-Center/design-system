// Escape and a click outside are dismiss's, tested in dismiss/dismiss.test.ts.
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import type { RenderResult } from "vitest-browser-svelte";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Menu from "./DropdownMenu.test.svelte";

type Screen = RenderResult<typeof Menu>;

const arrow = (screen: Screen) =>
  screen.getByRole("button", { name: "More actions for Jo Rivera" });

/** The panel the arrow controls. */
const panel = (screen: Screen) =>
  document.getElementById(
    arrow(screen).element().getAttribute("aria-controls")!,
  )!;

describe("DropdownMenu", () => {
  test("is a secondary button named by its label, closed to start", async () => {
    const screen = await renderIn("light", Menu, {});

    await expect
      .element(arrow(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect
      .element(screen.getByRole("button", { name: "Withdraw" }))
      .not.toBeInTheDocument();
    // Button's outline (buttonClasses).
    await expect.element(arrow(screen)).toHaveStyle({
      color: role("foreground", "light"),
      borderColor: role("input", "light"),
    });
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

  // Its dismiss is wired in.
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
    panel: panel(screen).getBoundingClientRect(),
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

  test("draws the panel on the card", async () => {
    const screen = await renderIn("light", Menu, {});
    await arrow(screen).click();

    await expect.element(panel(screen)).toHaveStyle({
      backgroundColor: role("card", "light"),
      borderColor: role("border", "light"),
    });
    await expect
      .element(screen.getByRole("button", { name: "Withdraw" }))
      .toHaveStyle({ color: role("foreground", "light") });
  });

  test("a primary arrow attached to its button matches it", async () => {
    const screen = await renderIn("light", Menu, {
      attached: true,
      variant: "primary",
    });
    const main = screen.getByRole("button", { name: "Approve" });

    await expect.element(arrow(screen)).toHaveStyle({
      backgroundColor: role("primary", "light"),
      color: role("primary-foreground", "light"),
      borderLeftColor: role("primary-hover", "light"),
    });
    // Flush: the arrow starts where the button ends.
    expect(
      Math.round(arrow(screen).element().getBoundingClientRect().left),
    ).toBe(Math.round(main.element().getBoundingClientRect().right));
  });
});
