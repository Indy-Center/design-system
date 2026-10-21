import { describe, expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render, type RenderResult } from "vitest-browser-svelte";
import { renderIn } from "../../../test/schemes.ts";
import Disclosure from "./dismiss.test.svelte";

type Screen = RenderResult<typeof Disclosure>;

const trigger = (screen: Screen) =>
  screen.getByRole("button", { name: "Apps" });

/** Opens the test disclosure and puts focus inside its panel. */
async function openWithFocusInside(screen: Screen) {
  await trigger(screen).click();
  await screen.getByRole("button", { name: "Inside" }).click();
  return screen;
}

describe("dismiss", () => {
  test("Escape closes the panel and puts focus back on the trigger", async () => {
    const screen = await openWithFocusInside(
      await renderIn("light", Disclosure, {}),
    );

    await userEvent.keyboard("{Escape}");

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(trigger(screen)).toHaveFocus();
  });

  test("a click outside closes the panel and leaves focus where it went", async () => {
    const screen = await openWithFocusInside(
      await renderIn("light", Disclosure, {}),
    );
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });

    await elsewhere.click();

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(elsewhere).toHaveFocus();
  });

  test("a click inside the panel leaves it open", async () => {
    const screen = await openWithFocusInside(
      await renderIn("light", Disclosure, {}),
    );

    await screen.getByText("Some text").click();

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "true");
    await expect
      .element(screen.getByRole("button", { name: "Inside" }))
      .toBeVisible();
  });

  // A press on the trigger isn't outside: the trigger's own click closes
  // the panel, and it doesn't open again straight after.
  test("a click on the trigger closes the panel once", async () => {
    const screen = await openWithFocusInside(
      await renderIn("light", Disclosure, {}),
    );

    await trigger(screen).click();

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
  });

  // Like a tooltip shown on hover: Escape hides it, but focus was never in
  // it, so focus stays put.
  test("Escape leaves focus alone when it is elsewhere on the page", async () => {
    const screen = await renderIn("light", Disclosure, { open: true });
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    elsewhere.element().focus();

    await userEvent.keyboard("{Escape}");

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(elsewhere).toHaveFocus();
  });

  // Typing with an input method (Japanese, say), Escape cancels the text
  // being composed, as in a combobox's input.
  test("Escape while composing text leaves the panel open", async () => {
    const screen = await openWithFocusInside(
      await renderIn("light", Disclosure, {}),
    );
    const inside = screen.getByRole("button", { name: "Inside" }).element();

    inside.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        isComposing: true,
        bubbles: true,
      }),
    );

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "true");
  });

  test("does nothing while the panel is closed", async () => {
    const screen = await renderIn("light", Disclosure, {});
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });

    await elsewhere.click();
    await userEvent.keyboard("{Escape}");

    await expect.element(elsewhere).toHaveFocus();
    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
  });

  // A combobox in a form in a modal: Escape closes the list, not the modal.
  test("Escape inside a modal dialog closes the panel and not the dialog", async () => {
    // renderIn can't draw into a dialog.
    const dialog = document.createElement("dialog");
    document.body.append(dialog);
    onTestFinished(() => dialog.remove());
    dialog.showModal();
    const screen = await openWithFocusInside(
      await render(Disclosure, { target: dialog }),
    );

    await userEvent.keyboard("{Escape}");

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
    expect(dialog.open).toBe(true);

    await userEvent.keyboard("{Escape}");
    await expect.poll(() => dialog.open).toBe(false);
  });

  // A tooltip in an open menu: the first Escape hides the tooltip, the
  // second closes the menu.
  test("Escape closes only the innermost open panel", async () => {
    const screen = await renderIn("light", Disclosure, { nested: true });
    const more = screen.getByRole("button", { name: "More" });
    await trigger(screen).click();
    await more.click();

    await userEvent.keyboard("{Escape}");

    await expect.element(more).toHaveAttribute("aria-expanded", "false");
    await expect.element(more).toHaveFocus();
    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(trigger(screen)).toHaveFocus();
  });

  // A tooltip hovered elsewhere opens last, but focus is in the menu: the
  // Escape is the menu's.
  test("Escape closes the panel holding focus before one opened later", async () => {
    const screen = await openWithFocusInside(
      await renderIn("light", Disclosure, { beside: true }),
    );
    const help = screen.getByRole("button", { name: "Help" });
    // A script's click, as a hover would: no press, and focus stays put.
    (help.element() as HTMLButtonElement).click();
    await expect.element(help).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(help).toHaveAttribute("aria-expanded", "true");
  });

  // A tooltip hovered on one row of a menu while focus is on another.
  test("Escape closes a panel inside the one holding focus first", async () => {
    const screen = await openWithFocusInside(
      await renderIn("light", Disclosure, { nested: true }),
    );
    const more = screen.getByRole("button", { name: "More" });
    // A script's click, as a hover would: focus stays on "Inside".
    (more.element() as HTMLButtonElement).click();
    await expect.element(more).toHaveAttribute("aria-expanded", "true");

    await userEvent.keyboard("{Escape}");

    await expect.element(more).toHaveAttribute("aria-expanded", "false");
    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "true");
  });

  test("a click outside both nested panels closes both", async () => {
    const screen = await renderIn("light", Disclosure, { nested: true });
    const more = screen.getByRole("button", { name: "More" });
    await trigger(screen).click();
    await more.click();

    // Hidden with its panel, so a locator can't find it after.
    const moreButton = more.element();

    await screen.getByRole("button", { name: "Elsewhere" }).click();

    await expect
      .poll(() => moreButton.getAttribute("aria-expanded"))
      .toBe("false");
    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
  });

  test("a click in the outer panel closes only the inner one", async () => {
    const screen = await renderIn("light", Disclosure, { nested: true });
    const more = screen.getByRole("button", { name: "More" });
    await trigger(screen).click();
    await more.click();

    await screen.getByText("Some text").click();

    await expect.element(more).toHaveAttribute("aria-expanded", "false");
    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "true");
  });
});

/**
 * Sends a pointer event of `type` at a point on the page, on `target`.
 * userEvent can't drag a finger or have the browser cancel a touch.
 */
function point(
  target: Element,
  type: string,
  x: number,
  y: number,
  { second = false } = {},
) {
  target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      composed: true,
      // A second finger is a different pointer, and not the primary one.
      pointerId: second ? 8 : 7,
      pointerType: "touch",
      isPrimary: !second,
      clientX: x,
      clientY: y,
    }),
  );
}

// On a phone a finger that starts outside the menu to scroll the page
// shouldn't close it: only a tap does.
describe("dismiss, a press outside that isn't a tap", () => {
  async function openScreen() {
    const screen = await renderIn("light", Disclosure, { open: true });
    const elsewhere = screen
      .getByRole("button", { name: "Elsewhere" })
      .element();
    const { left, top } = elsewhere.getBoundingClientRect();
    return { screen, elsewhere, x: left + 5, y: top + 5 };
  }

  test("a press that moves before it lifts (a drag) leaves the panel open", async () => {
    const { screen, elsewhere, x, y } = await openScreen();

    point(elsewhere, "pointerdown", x, y);
    point(elsewhere, "pointermove", x, y + 40);
    point(elsewhere, "pointerup", x, y + 40);

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "true");
  });

  // The browser cancels the pointer when it takes the touch for a scroll.
  test("a press the browser takes over to scroll leaves the panel open", async () => {
    const { screen, elsewhere, x, y } = await openScreen();

    point(elsewhere, "pointerdown", x, y);
    point(elsewhere, "pointercancel", x, y);
    point(elsewhere, "pointerup", x, y);

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "true");
  });

  test("a tap that wobbles a little still closes the panel", async () => {
    const { screen, elsewhere, x, y } = await openScreen();

    point(elsewhere, "pointerdown", x, y);
    point(elsewhere, "pointerup", x + 3, y + 2);

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
  });

  test("a press that starts in the panel and lifts outside leaves it open", async () => {
    const { screen, elsewhere, x, y } = await openScreen();
    const inside = screen.getByRole("button", { name: "Inside" }).element();

    point(inside, "pointerdown", x, y);
    point(elsewhere, "pointerup", x, y);

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "true");
  });

  test("a second finger landing doesn't spoil the first finger's tap", async () => {
    const { screen, elsewhere, x, y } = await openScreen();
    const inside = screen.getByRole("button", { name: "Inside" }).element();

    point(elsewhere, "pointerdown", x, y);
    point(inside, "pointerdown", x, y, { second: true });
    point(elsewhere, "pointerup", x, y);

    await expect
      .element(trigger(screen))
      .toHaveAttribute("aria-expanded", "false");
  });
});
