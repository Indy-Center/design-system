import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Disclosure from "./Disclosure.svelte";

const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

const props = () => ({
  summary: text("Why do I need a rating?"),
  children: text("Each position needs its own rating."),
});

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

  // A native <summary>: the browser gives readers its expanded state.
  test("opens and closes from the keyboard", async () => {
    const screen = await renderIn("light", Disclosure, props());
    await userEvent.tab();
    await expect
      .element(screen.container.querySelector("summary")!)
      .toHaveFocus();
    const content = screen.getByText("Each position needs its own rating.");
    await userEvent.keyboard("{Enter}");
    await expect.element(content).toBeVisible();
    await userEvent.keyboard(" ");
    await expect.element(content).not.toBeVisible();
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
  test.each(SCHEMES)("takes the text roles in %s", async (scheme) => {
    const screen = await renderIn(scheme, Disclosure, {
      ...props(),
      open: true,
    });
    await expect
      .element(screen.container.querySelector("summary")!)
      .toHaveStyle({ color: role("foreground", scheme) });
    await expect
      .element(screen.getByText("Each position needs its own rating."))
      .toHaveStyle({ color: role("foreground-soft", scheme) });
  });

  // The `ring` role.
  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Disclosure, props());
      await userEvent.tab();
      await expect
        .element(screen.container.querySelector("summary")!)
        .toHaveStyle({
          outlineStyle: "solid",
          outlineColor: role("ring", scheme),
        });
    },
  );

  // Several with one `name` form a group where only one is open.
  test("passes name through, so a group opens one at a time", async () => {
    const screen = await renderIn("light", Disclosure, {
      ...props(),
      name: "faq",
    });
    await expect
      .element(screen.container.querySelector("details")!)
      .toHaveAttribute("name", "faq");
  });
});
