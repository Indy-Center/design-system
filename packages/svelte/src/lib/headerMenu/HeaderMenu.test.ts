import { describe, expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import { expectReadable, translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Menu from "./HeaderMenu.test.svelte";

type Screen = Awaited<ReturnType<typeof renderIn>>;

const button = (screen: Screen) =>
  screen.getByRole("button", { name: /^Menu/ });

/** The panel the button controls. */
const panel = (screen: Screen) =>
  document.getElementById(
    button(screen).element().getAttribute("aria-controls")!,
  )!;

async function open() {
  const screen = await renderIn("light", Menu, {});
  await button(screen).click();
  await expect.element(button(screen)).toHaveAttribute("aria-expanded", "true");
  return screen;
}

const expectClosed = (screen: Screen) =>
  expect.element(button(screen)).toHaveAttribute("aria-expanded", "false");

describe("HeaderMenu", () => {
  test("opens and closes its panel from the button, telling the trigger", async () => {
    const screen = await renderIn("light", Menu, {});
    await expectClosed(screen);
    await expect.element(panel(screen)).not.toBeVisible();

    await button(screen).click();
    await expect.element(button(screen)).toHaveAccessibleName("Menu (open)");
    await expect.element(panel(screen)).toBeVisible();
    await expect
      .element(screen.getByRole("link", { name: "One" }))
      .toBeVisible();

    await button(screen).click();
    await expectClosed(screen);
  });

  test("Escape closes it and puts focus back on the button", async () => {
    const screen = await open();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("link", { name: "One" }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expectClosed(screen);
    await expect.element(button(screen)).toHaveFocus();
  });

  test("a click outside closes it", async () => {
    const screen = await open();
    await userEvent.click(document.body, { position: { x: 1, y: 1 } });
    await expectClosed(screen);
  });

  test("closes when focus Tabs out of it", async () => {
    const screen = await open();
    await userEvent.tab(); // One
    await userEvent.tab(); // Two
    await userEvent.tab(); // After, outside
    await expect
      .element(screen.getByRole("link", { name: "After" }))
      .toHaveFocus();
    await expectClosed(screen);
  });

  // Focus leaves the link for nowhere; that isn't Tabbing away.
  test("stays open on a click on its panel's padding", async () => {
    const screen = await open();
    await userEvent.tab();
    await userEvent.click(panel(screen), { position: { x: 2, y: 2 } });
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "true");
  });

  // Following a link changes the page; the menu shouldn't stay open on it.
  test("closes when a link in it is followed", async () => {
    const screen = await open();
    await screen.getByRole("link", { name: "One" }).click();
    await expectClosed(screen);
  });

  // A Ctrl-, Cmd- or Shift-click opens the link elsewhere; this page stays.
  test.each(["ctrlKey", "metaKey", "shiftKey"] as const)(
    "stays open when a link is opened elsewhere (%s)",
    async (key) => {
      const screen = await open();
      // Keep the test's page from opening a tab or window, which leaves it
      // throttled for the tests after. Only a cancelable click can be
      // stopped.
      const stop = (event: Event) => event.preventDefault();
      window.addEventListener("click", stop);
      onTestFinished(() => window.removeEventListener("click", stop));
      screen
        .getByRole("link", { name: "One" })
        .element()
        .dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            [key]: true,
          }),
        );
      await expect
        .element(button(screen))
        .toHaveAttribute("aria-expanded", "true");
    },
  );

  test("gives the button, a menu row and a bar link a 44px target", async () => {
    const screen = await open();
    for (const el of [
      button(screen).element(),
      screen.getByRole("link", { name: "One" }).element(),
      screen.getByRole("link", { name: "After" }).element(),
    ]) {
      const box = el.getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test("shows a ring outline on the button and a link tabbed to", async () => {
    const screen = await renderIn("light", Menu, {});
    await userEvent.tab();
    await expect.element(button(screen)).toHaveFocus();
    await expect.element(button(screen)).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
    await userEvent.tab(); // the panel is closed: on to After
    const after = screen.getByRole("link", { name: "After" });
    await expect.element(after).toHaveFocus();
    await expect.element(after).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  test("draws the button soft and the panel a card", async () => {
    const screen = await renderIn("light", Menu, {});
    await expect
      .element(button(screen))
      .toHaveStyle({ color: role("foreground-soft", "light") });
    await button(screen).click();
    await expect.element(panel(screen)).toHaveStyle({
      backgroundColor: role("card", "light"),
      borderTopColor: role("border", "light"),
    });
  });

  test("draws links in the link colour, the current one on the soft fill and underlined", async () => {
    const screen = await open();
    for (const name of ["One", "After"]) {
      const link = screen.getByRole("link", { name });
      await expect.element(link).toHaveStyle({
        color: role("link", "light"),
        backgroundColor: "rgba(0, 0, 0, 0)", // no fill
        textDecorationLine: "none",
      });
      expectReadable(link.element(), "light");
    }
    for (const name of ["Two", "Here"]) {
      await expect.element(screen.getByRole("link", { name })).toHaveStyle({
        color: role("link", "light"),
        backgroundColor: translucent(role("foreground", "light"), 10),
        textDecorationLine: "underline",
      });
    }
  });
});
