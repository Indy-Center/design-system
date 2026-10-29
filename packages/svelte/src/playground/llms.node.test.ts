import { describe, expect, test } from "vitest";
import { SITE } from "./docNames.ts";
import { llmsFullTxt, llmsTxt } from "./llms.ts";
import { pages } from "./site.ts";

// Found here on their own, not through site.ts, so a page it misses fails.
const routes = Object.keys(import.meta.glob("../routes/*/+page.svelte")).map(
  (path) => path.split("/")[2],
);
const docs = import.meta.glob<string>("../lib/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// A doc's body, its links left out: llms-full.txt makes them absolute.
const withoutLinks = (text: string) => text.replace(/\]\([^)]*\)/g, "]()");
const body = (source: string) =>
  withoutLinks(source.replace(/^---\n[\s\S]*?\n---\n/, "").trim());

describe("llms.txt", () => {
  test.each(routes)("lists the %s page", (route) => {
    expect(llmsTxt()).toContain(`](${SITE}/${route}): `);
  });

  test("gives every page its summary", () => {
    for (const page of pages)
      expect(llmsTxt()).toContain(
        `- [${page.label}](${SITE}${page.href}): ${page.summary}`,
      );
  });
});

describe("llms-full.txt", () => {
  const full = withoutLinks(llmsFullTxt());

  test.each(Object.keys(docs))("holds %s", (path) => {
    expect(full).toContain(body(docs[path]));
  });

  test("puts the docs in sidebar order", () => {
    const at = pages
      .filter((page) => page.doc)
      .map((page) => full.indexOf(body(docs[page.doc!])));
    expect(at).toEqual([...at].sort((a, b) => a - b));
  });

  test("opens with the home page, then both packages' READMEs", () => {
    expect(full.indexOf("# Indy Centerline\n")).toBe(0);
    const tokens = full.indexOf("# Indy Centerline tokens");
    const svelte = full.indexOf("# Indy Centerline for Svelte");
    expect(0).toBeLessThan(tokens);
    expect(tokens).toBeLessThan(svelte);
    expect(svelte).toBeLessThan(full.indexOf("# Airport"));
  });
});
