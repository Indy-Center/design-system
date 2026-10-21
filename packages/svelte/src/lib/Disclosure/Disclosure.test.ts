import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import Disclosure from "./Disclosure.svelte";

const props = () => ({
  summary: text("Why do I need a rating?"),
  children: text("Each position needs its own rating."),
});

// A native <details>: the browser opens it from the keyboard and gives
// readers its expanded state.
describe("Disclosure", () => {
  test("starts closed, its summary showing and its content hidden", async () => {
    const screen = await renderIn("light", Disclosure, props());
    await expect
      .element(screen.getByText("Why do I need a rating?"))
      .toBeVisible();
    await expect
      .element(screen.getByText("Each position needs its own rating."))
      .not.toBeVisible();
  });

  test("opens on a click, and can start open", async () => {
    const screen = await renderIn("light", Disclosure, {
      ...props(),
      open: true,
    });
    const content = screen.getByText("Each position needs its own rating.");
    await expect.element(content).toBeVisible();
    await screen.getByText("Why do I need a rating?").click();
    await expect.element(content).not.toBeVisible();
  });

  test("its summary is at least 44px tall", async () => {
    const screen = await renderIn("light", Disclosure, props());
    const box = screen.container
      .querySelector("summary")!
      .getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  // `foreground` for the summary, `foreground-soft` for what it shows.
  test("takes the text roles", async () => {
    const screen = await renderIn("light", Disclosure, {
      ...props(),
      open: true,
    });
    await expect
      .element(screen.container.querySelector("summary")!)
      .toHaveStyle({ color: role("foreground", "light") });
    await expect
      .element(screen.getByText("Each position needs its own rating."))
      .toHaveStyle({ color: role("foreground-soft", "light") });
  });

  // The `ring` role.
  test("shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", Disclosure, props());
    await userEvent.tab();
    await expect
      .element(screen.container.querySelector("summary")!)
      .toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", "light"),
      });
  });

  // Several with one `name` form a group where only one is open.
  test("passes name through, so a group opens one at a time", async () => {
    const screen = await renderIn("light", Disclosure, {
      ...props(),
      name: "faq",
    });
    await expect
      .element(screen.getByRole("group"))
      .toHaveAttribute("name", "faq");
  });
});
