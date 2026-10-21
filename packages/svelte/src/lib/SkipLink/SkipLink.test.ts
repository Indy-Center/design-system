import { afterEach, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import SkipLink from "./SkipLink.svelte";

const added: HTMLElement[] = [];
afterEach(() => {
  for (const el of added.splice(0)) el.remove();
});

/** The page's content after the skip link: a link to tab past, then `id`. */
function content(id = "main") {
  const nav = document.createElement("nav");
  nav.innerHTML = `<a href="/events">Events</a>`;
  const main = document.createElement("div");
  main.id = id;
  main.innerHTML = `<h1>Roster</h1>`;
  document.body.append(nav, main);
  added.push(nav, main);
  return main;
}

describe("SkipLink", () => {
  test('is a link to #main that says "Skip to content"', async () => {
    const screen = await renderIn("light", SkipLink, {});
    await expect
      .element(screen.getByRole("link", { name: "Skip to content" }))
      .toHaveAttribute("href", "#main");
  });

  test("is hidden until it has focus", async () => {
    const screen = await renderIn("light", SkipLink, {});
    const link = screen.getByRole("link");
    await expect.element(link).toHaveStyle({ width: "1px", height: "1px" });
    await userEvent.tab();
    await expect.element(link).toHaveFocus();
    await expect.element(link).not.toHaveStyle({ width: "1px" });
    await expect.element(link).toBeVisible();
  });

  test("is first on Tab, before the content after it", async () => {
    const screen = await renderIn("light", SkipLink, {});
    content();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("link", { name: "Skip to content" }))
      .toHaveFocus();
  });

  test("moves focus to the content on Enter", async () => {
    await renderIn("light", SkipLink, {});
    const main = content();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(main).toHaveFocus();
    // The next Tab starts from the content, past the header's links.
    await userEvent.tab();
    await expect
      .element(page.getByRole("link", { name: "Events" }))
      .not.toHaveFocus();
  });

  test("targets the id it's given", async () => {
    const screen = await renderIn("light", SkipLink, { href: "#content" });
    const target = content("content");
    await expect
      .element(screen.getByRole("link"))
      .toHaveAttribute("href", "#content");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(target).toHaveFocus();
  });

  // The `card` role behind `link` text, with the `ring` outline.
  test.each(SCHEMES)(
    "shows as a link on a card, with a ring, in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, SkipLink, {});
      await userEvent.tab();
      await expect.element(screen.getByRole("link")).toHaveStyle({
        backgroundColor: role("card", scheme),
        color: role("link", scheme),
        textDecorationLine: "underline",
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    },
  );

  test("is at least 44px tall when shown", async () => {
    const screen = await renderIn("light", SkipLink, {});
    await userEvent.tab();
    const link = screen.getByRole("link").element();
    expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });
});
