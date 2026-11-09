import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import body from "../../playground/lesson-plan-body.json" with { type: "json" };
import RichText from "../RichText/RichText.svelte";
import RichTextWithBlocks from "../RichText/RichText.test.svelte";
import type { RichTextState, SerializedNode } from "../RichText/nodes.ts";
import TableOfContents from "./TableOfContents.svelte";

const fixture = body as RichTextState;

const doc = (...children: SerializedNode[]): RichTextState => ({
  root: { type: "root", children },
});
const heading = (tag: string, words: string): SerializedNode => ({
  type: "heading",
  tag,
  children: [{ type: "text", text: words, format: 0 }],
});

// Several headings, a repeat, and one inside a block's content.
const outline = doc(
  heading("h2", "Runways"),
  heading("h3", "Hold short"),
  heading("h3", "Runways"),
  heading("h2", "Pilot's view"),
  heading("h4", "Too deep"),
  {
    type: "block",
    fields: {
      blockType: "callout",
      content: doc(heading("h2", "Runways")),
    },
  } as unknown as SerializedNode,
);

/** The ids of the headings RichText drew, with the hrefs of the list's links. */
async function drawBoth(props: { headingId?: (words: string) => string } = {}) {
  const contents = await renderIn("light", TableOfContents, {
    content: outline,
    ...props,
  });
  const text = await renderIn("light", RichTextWithBlocks, {
    content: outline,
    ...props,
  });
  return {
    contents,
    hrefs: contents
      .getByRole("link")
      .elements()
      .map((a) => a.getAttribute("href") ?? ""),
    ids: text
      .getByRole("heading")
      .elements()
      .map((h) => h.id),
  };
}

describe("TableOfContents", () => {
  test("is a navigation named Contents, holding an ordered list of the h2s and h3s", async () => {
    const screen = await renderIn("light", TableOfContents, {
      content: outline,
    });
    const nav = screen.getByRole("navigation", { name: "Contents" });
    await expect.element(nav).toBeInTheDocument();
    expect(nav.getByRole("list").first().element().tagName).toBe("OL");
    const links = nav.getByRole("link").elements();
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      "Runways",
      "Hold short",
      "Runways",
      "Pilot's view",
      "Runways",
    ]);
  });

  test("nests an h3 under its h2, one level, and leaves out deeper ones", async () => {
    const screen = await renderIn("light", TableOfContents, {
      content: outline,
    });
    const nav = screen.getByRole("navigation", { name: "Contents" }).element();
    const top = nav.querySelectorAll(":scope > ol > li");
    expect(top).toHaveLength(3);
    expect(top[0].querySelectorAll(":scope > ol > li")).toHaveLength(2);
    expect(top[1].querySelector("ol")).toBeNull();
    expect(nav.textContent).not.toContain("Too deep");
  });

  test("its links go to the ids RichText gives the headings, repeats included", async () => {
    const { hrefs, ids } = await drawBoth();
    expect(hrefs).toEqual([
      "#runways",
      "#hold-short",
      "#runways-2",
      "#pilots-view",
      "#runways-3",
    ]);
    for (const href of hrefs) expect(ids).toContain(href.slice(1));
  });

  test("an app's own headingId gives both the same ids", async () => {
    const { hrefs, ids } = await drawBoth({
      headingId: (words) => `x-${words.length}`,
    });
    expect(hrefs).toEqual(["#x-7", "#x-10", "#x-7-2", "#x-12", "#x-7-3"]);
    for (const href of hrefs) expect(ids).toContain(href.slice(1));
  });

  test("a label renames the landmark", async () => {
    const screen = await renderIn("light", TableOfContents, {
      content: outline,
      label: "On this page",
    });
    await expect
      .element(screen.getByRole("navigation", { name: "On this page" }))
      .toBeInTheDocument();
  });

  test("draws nothing for a document with no h2 or h3", async () => {
    const screen = await renderIn("light", TableOfContents, {
      content: doc(heading("h4", "Notes")),
    });
    await expect
      .element(screen.getByRole("navigation"))
      .not.toBeInTheDocument();
  });

  test("lists the fixture's headings", async () => {
    const screen = await renderIn("light", TableOfContents, {
      content: fixture,
    });
    const nav = screen.getByRole("navigation", { name: "Contents" });
    await expect
      .element(nav.getByRole("link", { name: "Runways" }))
      .toHaveAttribute("href", "#runways");
    await expect
      .element(nav.getByRole("link", { name: "Hold short" }))
      .toHaveAttribute("href", "#hold-short");
  });
});

describe("a heading's anchor link", () => {
  test("is named for its section and goes to the heading's id", async () => {
    const screen = await renderIn("light", RichText, { content: fixture });
    const link = screen.getByRole("link", {
      name: "Link to section: Runways",
    });
    await expect.element(link).toHaveAttribute("href", "#runways");
    // Beside the heading, not inside it.
    expect(link.element().previousElementSibling?.id).toBe("runways");
  });

  test("is drawn for each heading", async () => {
    const screen = await renderIn("light", RichTextWithBlocks, {
      content: outline,
    });
    const links = screen.getByRole("link").elements();
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#runways",
      "#hold-short",
      "#runways-2",
      "#pilots-view",
      "#too-deep",
      "#runways-3",
    ]);
  });

  test("is hidden until the heading is hovered or the link focused", async () => {
    const screen = await renderIn("light", RichText, { content: fixture });
    const link = screen.getByRole("link", { name: "Link to section: Runways" });
    const opacity = () => getComputedStyle(link.element()).opacity;
    expect(opacity()).toBe("0");
    const heading = screen.getByRole("heading", {
      name: "Runways",
      exact: true,
      level: 2,
    });
    await userEvent.hover(heading);
    await expect.poll(opacity).toBe("1");
    await userEvent.unhover(heading);
    await expect.poll(opacity).toBe("0");
    // The link itself, beside the heading, keeps it shown while the pointer moves to it.
    await userEvent.hover(link);
    await expect.poll(opacity).toBe("1");
    await userEvent.unhover(link);
    await userEvent.tab();
    expect(document.activeElement).toBe(link.element());
    expect(opacity()).toBe("1");
  });
});
