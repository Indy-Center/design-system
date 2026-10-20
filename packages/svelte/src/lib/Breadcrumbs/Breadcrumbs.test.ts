import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
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
    // Nothing else beside the link carries text.
    for (const li of [second, last]) {
      expect(li.querySelector("[aria-hidden='true']")!.textContent).toBe("");
    }
  });

  test("can be given another name, for a page in another language", async () => {
    const screen = await renderIn("light", Breadcrumbs, {
      ...props(),
      label: "Fil d'Ariane",
    });
    await expect
      .element(screen.getByRole("navigation", { name: "Fil d'Ariane" }))
      .toBeInTheDocument();
  });

  // The guide's `link` role (#0369A1 light, #38BDF8 dark), underlined, for
  // the pages above; `foreground-soft` (#334155 light, #D1D5DB dark), not
  // underlined, for the page being shown.
  test.each([
    ["light", "rgb(3, 105, 161)", "rgb(51, 65, 85)"],
    ["dark", "rgb(56, 189, 248)", "rgb(209, 213, 219)"],
    ["dark-header", "rgb(56, 189, 248)", "rgb(209, 213, 219)"],
  ] as const)(
    "shows the pages above as links, the current as text, in %s",
    async (scheme, link, current) => {
      const screen = await renderIn(scheme, Breadcrumbs, props());
      await expect
        .element(screen.getByRole("link", { name: "SOPs" }))
        .toHaveStyle({ color: link, textDecorationLine: "underline" });
      await expect
        .element(screen.getByRole("link", { name: "ZID Center SOP" }))
        .toHaveStyle({ color: current, textDecorationLine: "none" });
    },
  );

  test("each crumb is at least 44px tall", async () => {
    const screen = await renderIn("light", Breadcrumbs, props());
    for (const a of screen.getByRole("link").elements()) {
      expect(a.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
  });

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Breadcrumbs, props());
      await userEvent.tab();
      const first = screen.getByRole("link", { name: "Library" });
      await expect.element(first).toHaveFocus();
      await expect
        .element(first)
        .toHaveStyle({ outlineStyle: "solid", outlineColor: colour });
    },
  );
});
