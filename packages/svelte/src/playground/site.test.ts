import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderIn } from "../../test/schemes.ts";
import DocPage from "./DocPage.svelte";
import Sidebar from "./Sidebar.svelte";
import { loadDoc, pages, sections } from "./site.ts";

// Found here on their own, not through site.ts, so a page it misses fails.
const routes = Object.keys(import.meta.glob("../routes/*/+page.svelte")).map(
  (path) => path.split("/")[2],
);
const docs = import.meta.glob<string>("../lib/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("Sidebar", () => {
  test("links every component's page, and marks the current one", async () => {
    // Open: the test page is phone width, where it otherwise folds away.
    renderIn("light", Sidebar, { sections, current: "/link/", open: true });
    const nav = page.getByRole("navigation", { name: "Site" });
    await expect.element(nav).toBeVisible();
    const hrefs = nav
      .getByRole("link")
      .elements()
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toEqual(
      expect.arrayContaining(routes.map((route) => `/${route}`)),
    );
    await expect
      .element(nav.getByRole("link", { name: "Link", exact: true }))
      .toHaveAttribute("aria-current", "page");
  });
});

describe("DocPage", () => {
  const components = pages.filter((p) => p.kind === "component" && p.doc);

  test.each(components.map((p) => [p.href, p] as const))(
    "%s draws its doc's first heading above the demo",
    async (_, sitePage) => {
      const first = docs[sitePage.doc!].match(/^## (.+)$/m)![1];
      renderIn("light", DocPage, {
        page: sitePage,
        doc: await loadDoc(sitePage),
      });
      const heading = page.getByRole("heading", { level: 2, name: first });
      const demo = page.getByRole("heading", { level: 2, name: "Demo" });
      await expect.element(heading.first()).toBeVisible();
      await expect.element(demo).toBeVisible();
      expect(
        heading.first().element().compareDocumentPosition(demo.element()) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    },
  );

  test("draws a page's title as its h1", async () => {
    const link = pages.find((p) => p.href === "/link")!;
    renderIn("light", DocPage, { page: link, doc: await loadDoc(link) });
    await expect
      .element(page.getByRole("heading", { level: 1, name: "Link" }))
      .toBeVisible();
  });
});
