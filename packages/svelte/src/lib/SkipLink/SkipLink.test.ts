import { afterEach, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
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

  test("is first on Tab, and moves focus to the content on Enter", async () => {
    const screen = await renderIn("light", SkipLink, {});
    const main = content();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("link", { name: "Skip to content" }))
      .toHaveFocus();
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

  // A link's hash is percent-encoded; the id it names isn't.
  test("finds an id written encoded in the href", async () => {
    await renderIn("light", SkipLink, { href: "#r%C3%A9sum%C3%A9" });
    const target = content("résumé");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(target).toHaveFocus();
  });

  test("keeps a tabindex the content already has", async () => {
    await renderIn("light", SkipLink, {});
    const main = content();
    main.tabIndex = 0;
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect.element(main).toHaveFocus();
    expect(main.getAttribute("tabindex")).toBe("0");
  });

  test("calls a caller's onclick, then still moves focus", async () => {
    const clicks: MouseEvent[] = [];
    await renderIn("light", SkipLink, {
      onclick: (event: MouseEvent) => clicks.push(event),
    });
    const main = content();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(clicks).toHaveLength(1);
    await expect.element(main).toHaveFocus();
  });

  test("adds a caller's class and attributes to the link", async () => {
    const screen = await renderIn("light", SkipLink, {
      id: "skip",
      class: "ml-4",
    });
    const link = screen.getByRole("link");
    await expect.element(link).toHaveAttribute("id", "skip");
    await expect.element(link).toHaveStyle({ marginLeft: "16px" });
  });

  // The `card` role behind `link` text, with the `ring` outline.
  test("shows as a link on a card, with a ring", async () => {
    const screen = await renderIn("light", SkipLink, {});
    await userEvent.tab();
    await expect.element(screen.getByRole("link")).toHaveStyle({
      backgroundColor: role("card", "light"),
      color: role("link", "light"),
      textDecorationLine: "underline",
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  test("is at least 44px tall when shown", async () => {
    const screen = await renderIn("light", SkipLink, {});
    await userEvent.tab();
    const link = screen.getByRole("link").element();
    expect(link.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });
});
