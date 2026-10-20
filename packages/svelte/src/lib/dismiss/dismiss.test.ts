import { describe, expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import { renderIn } from "../../../test/schemes.ts";
import Disclosure from "./dismiss.test.svelte";

/** Renders the test disclosure, open, with focus inside its panel. */
async function openWithFocusInside() {
  const screen = await renderIn("light", Disclosure, {});
  await screen.getByRole("button", { name: "Apps" }).click();
  await screen.getByRole("button", { name: "Inside" }).click();
  return screen;
}

describe("dismiss", () => {
  test("Escape closes the panel and puts focus back on the trigger", async () => {
    const screen = await openWithFocusInside();
    const trigger = screen.getByRole("button", { name: "Apps" });

    await userEvent.keyboard("{Escape}");

    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
    await expect.element(trigger).toHaveFocus();
  });

  test("a click outside closes the panel and leaves focus where it went", async () => {
    const screen = await openWithFocusInside();
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });

    await elsewhere.click();

    await expect
      .element(screen.getByRole("button", { name: "Apps" }))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(elsewhere).toHaveFocus();
  });

  test("a click inside the panel leaves it open", async () => {
    const screen = await openWithFocusInside();

    await screen.getByText("Some text").click();

    await expect
      .element(screen.getByRole("button", { name: "Apps" }))
      .toHaveAttribute("aria-expanded", "true");
    await expect
      .element(screen.getByRole("button", { name: "Inside" }))
      .toBeVisible();
  });

  // A press on the trigger isn't outside: the trigger's own click closes
  // the panel, and it doesn't open again straight after.
  test("a click on the trigger closes the panel once", async () => {
    const screen = await openWithFocusInside();
    const trigger = screen.getByRole("button", { name: "Apps" });

    await trigger.click();

    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // Like a tooltip shown on hover: Escape hides it, but focus was never in
  // it, so focus stays put.
  test("Escape leaves focus alone when it is elsewhere on the page", async () => {
    const screen = await renderIn("light", Disclosure, { open: true });
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    elsewhere.element().focus();

    await userEvent.keyboard("{Escape}");

    await expect
      .element(screen.getByRole("button", { name: "Apps" }))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(elsewhere).toHaveFocus();
  });

  test("does nothing while the panel is closed", async () => {
    const screen = await renderIn("light", Disclosure, {});
    const trigger = screen.getByRole("button", { name: "Apps" });
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });

    await elsewhere.click();
    await userEvent.keyboard("{Escape}");

    await expect.element(elsewhere).toHaveFocus();
    await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // A combobox in a form in a modal: Escape closes the list, not the modal.
  test("Escape inside a modal dialog closes the panel and not the dialog", async () => {
    const dialog = document.createElement("dialog");
    document.body.append(dialog);
    onTestFinished(() => dialog.remove());
    dialog.showModal();
    const screen = await render(Disclosure, { target: dialog });
    await screen.getByRole("button", { name: "Apps" }).click();
    await screen.getByRole("button", { name: "Inside" }).click();

    await userEvent.keyboard("{Escape}");

    await expect
      .element(screen.getByRole("button", { name: "Apps" }))
      .toHaveAttribute("aria-expanded", "false");
    expect(dialog.open).toBe(true);

    await userEvent.keyboard("{Escape}");
    await expect.poll(() => dialog.open).toBe(false);
  });
});
