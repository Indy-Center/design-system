import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Breadcrumbs from "./Breadcrumbs.svelte";

const props = () => ({
  items: [
    { href: "/", label: "Library" },
    { href: "/sops", label: "SOPs" },
    { href: "/sops/zid-center", label: "ZID Center SOP" },
  ],
});

describe("Breadcrumbs", () => {
  test("is a navigation named Breadcrumb, holding an ordered list of links", async () => {
    const screen = await renderIn("light", Breadcrumbs, props());
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    await expect.element(nav.getByRole("list")).toBeInTheDocument();
    expect(nav.getByRole("list").element().tagName).toBe("OL");
    const items = nav.getByRole("listitem").elements();
    expect(items).toHaveLength(3);
    const links = nav.getByRole("link").elements();
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      "Library",
      "SOPs",
      "ZID Center SOP",
    ]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/",
      "/sops",
      "/sops/zid-center",
    ]);

    // Another name, for a page in another language.
    await screen.rerender({ label: "Fil d'Ariane" });
    await expect
      .element(screen.getByRole("navigation", { name: "Fil d'Ariane" }))
      .toBeInTheDocument();
  });

  test("marks the last as the current page", async () => {
    const screen = await renderIn("light", Breadcrumbs, props());
    await expect
      .element(screen.getByRole("link", { name: "ZID Center SOP" }))
      .toHaveAttribute("aria-current", "page");
    for (const name of ["Library", "SOPs"]) {
      await expect
        .element(screen.getByRole("link", { name }))
        .not.toHaveAttribute("aria-current");
    }
  });

  // Readers shouldn't say "slash" or "greater than" between crumbs.
  test("hides its separators from screen readers", async () => {
    const screen = await renderIn("light", Breadcrumbs, props());
    const [first, second, last] = screen.getByRole("listitem").elements();
    // One separator before each crumb but the first.
    expect(first.querySelector("[aria-hidden='true']")).toBeNull();
    expect(second.querySelector("[aria-hidden='true']")).not.toBeNull();
    expect(last.querySelector("[aria-hidden='true']")).not.toBeNull();
    // Nothing else beside the link carries text, and the chevron is
    // `muted-foreground`.
    for (const li of [second, last]) {
      const separator = li.querySelector("[aria-hidden='true']")!;
      expect(separator.textContent).toBe("");
      expect(getComputedStyle(separator).fill).toBe(
        role("muted-foreground", "light"),
      );
    }
  });

  // The current crumb isn't a Link, so it has its own ring.
  test("the current crumb shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", Breadcrumbs, props());
    for (let i = 0; i < 3; i++) await userEvent.tab();
    const current = screen.getByRole("link", { name: "ZID Center SOP" });
    await expect.element(current).toHaveFocus();
    await expect.element(current).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  // The pages above are Links, whose looks (colour, underline, ring) are
  // Link's: one check that they are wired in. The page being shown is
  // `foreground-soft`, not underlined.
  test("shows the pages above as links, the current as text", async () => {
    const screen = await renderIn("light", Breadcrumbs, props());
    await expect
      .element(screen.getByRole("link", { name: "SOPs" }))
      .toHaveStyle({
        color: role("link", "light"),
        textDecorationLine: "underline",
      });
    await expect
      .element(screen.getByRole("link", { name: "ZID Center SOP" }))
      .toHaveStyle({
        color: role("foreground-soft", "light"),
        textDecorationLine: "none",
      });
  });

  test("each crumb is at least 44px tall and wide", async () => {
    const screen = await renderIn("light", Breadcrumbs, {
      items: [
        { href: "/", label: "ZID" },
        { href: "/faq", label: "FAQ" },
      ],
    });
    for (const a of screen.getByRole("link").elements()) {
      const box = a.getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });
});
