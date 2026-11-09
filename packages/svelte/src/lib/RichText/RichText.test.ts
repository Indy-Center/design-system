import { beforeEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import body from "../../playground/lesson-plan-body.json" with { type: "json" };
import type { RichTextState, SerializedNode } from "./nodes.ts";
import RichText from "./RichText.svelte";
import RichTextWithBlocks from "./RichText.test.svelte";

// The fixture is JSON saved from Payload's editor; each case starts from
// it. The slug rule, the list nesting, the table's parts and an upload's
// srcset are draw.node.test.ts's and headings.node.test.ts's tables.
// RichText draws no colour of its own: its looks are Prose's.

const fixture = body as RichTextState;
const nodes = fixture.root.children;

/** A document of `children`. */
const doc = (...children: SerializedNode[]): RichTextState => ({
  root: { type: "root", children },
});

/** The fixture's first node of `type` that `match` picks. */
function find(
  type: string,
  match: (node: SerializedNode) => boolean = () => true,
): SerializedNode {
  const node = nodes.find((n) => n.type === type && match(n));
  if (!node) throw new Error(`The fixture has no ${type}`);
  return structuredClone(node);
}

const text = (s: string, format = 0): SerializedNode => ({
  type: "text",
  text: s,
  format,
});
const paragraph = (...children: SerializedNode[]): SerializedNode => ({
  type: "paragraph",
  children,
});

/** RichText drew nothing inside its Prose: no element and no text. */
function expectNothingDrawn(article: Element) {
  expect(article.children).toHaveLength(0);
  expect(article.textContent?.trim()).toBe("");
}

let warn: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  return () => warn.mockRestore();
});

/** The fixture's paragraph holding `words`. */
const paragraphWith = (words: string) =>
  find(
    "paragraph",
    (n) =>
      JSON.stringify(n).includes(words) &&
      !JSON.stringify(n).includes("tablecell"),
  );

describe("RichText", () => {
  test("is an article, Prose's, holding the document's h2–h4 with slug ids", async () => {
    const screen = await renderIn("light", RichText, { content: fixture });
    const article = screen.getByRole("article");
    await expect.element(article).toHaveClass("prose");
    for (const [level, name, id] of [
      [2, "Runways", "runways"],
      [3, "Hold short", "hold-short"],
      [4, "Notes", "notes"],
    ] as const) {
      await expect
        .element(article.getByRole("heading", { level, name }))
        .toHaveAttribute("id", id);
    }
  });

  test("passes Prose's props on, and keeps a caller's class and attributes", async () => {
    const screen = await renderIn("light", RichText, {
      content: fixture,
      as: "div",
      id: "body",
      class: "mt-8",
    });
    await expect.element(screen.getByRole("article")).not.toBeInTheDocument();
    const body = page.elementLocator(screen.container.querySelector("#body")!);
    await expect.element(body).toHaveClass("prose");
    await expect.element(body).toHaveStyle({ marginTop: "32px" });
  });

  test("draws nothing for no content", async () => {
    const screen = await renderIn("light", RichText, { content: null });
    expectNothingDrawn(screen.getByRole("article").element());
  });

  test("an app's headingId gives the ids, -2 on a repeat", async () => {
    const screen = await renderIn("light", RichText, {
      content: doc(
        { type: "heading", tag: "h2", children: [text("Runways")] },
        { type: "heading", tag: "h2", children: [text("Runways")] },
      ),
      headingId: (words) => `section-${words.length}`,
    });
    const [first, second] = screen
      .getByRole("heading", { name: "Runways" })
      .elements();
    expect([first.id, second.id]).toEqual(["section-7", "section-7-2"]);
  });

  describe("text", () => {
    // <u> and <s> have no role, so these are found by tag.
    test("each format is its element, and the sentence keeps its spaces", async () => {
      const screen = await renderIn("light", RichText, {
        content: doc(paragraphWith("Tower ")),
      });
      const p = screen.getByText(/^Tower/);
      await expect.element(p).toBeVisible();
      expect(p.element().textContent).toBe(
        "Tower controls every runway. Read back each landing clearance.",
      );
      const el = (selector: string) =>
        screen.container.querySelector(selector)?.textContent;
      expect(el("em")).toBe("controls");
      expect(el("strong")).toBe("every");
      expect(el("u")).toBe("Read back");
      expect(el("s")).toBe("landing");
    });

    // The editor's toolbar has these, but the fixture's author didn't use
    // them: the same paragraph, its formats changed.
    test("code, sub and superscript, formats together, and a line break", async () => {
      const screen = await renderIn("light", RichText, {
        content: doc(
          paragraph(
            text("Squawk "),
            text("7600", 16),
            text(", CO"),
            text("2", 32),
            text(", 10"),
            text("3", 64),
            { type: "linebreak" },
            text("Bold italic", 1 | 2),
          ),
        ),
      });
      const el = (selector: string) =>
        screen.container.querySelector(selector)?.textContent;
      expect(el("code")).toBe("7600");
      expect(el("sub")).toBe("2");
      expect(el("sup")).toBe("3");
      expect(el("strong > em")).toBe("Bold italic");
      expect(screen.container.querySelector("br")).not.toBeNull();
    });

    test("an empty paragraph draws nothing", async () => {
      const empty = find("paragraph", (n) => (n.children as []).length === 0);
      const screen = await renderIn("light", RichText, {
        content: doc(empty, empty),
      });
      expectNothingDrawn(screen.getByRole("article").element());
    });

    test("alignment is data-align, and no inline style is written", async () => {
      const centred = find("paragraph", (n) => n.format === "center");
      const right = { ...paragraph(text("Right.")), format: "right" };
      const justified = { ...paragraph(text("Justified.")), format: "justify" };
      const left = { ...paragraph(text("Left.")), format: "left" };
      const screen = await renderIn("light", RichText, {
        content: doc(centred, right, justified, left),
      });
      for (const [name, value] of [
        ["Centred.", "center"],
        ["Right.", "end"],
        ["Justified.", "justify"],
      ]) {
        await expect
          .element(screen.getByText(name))
          .toHaveAttribute("data-align", value);
      }
      await expect
        .element(screen.getByText("Left."))
        .not.toHaveAttribute("data-align");
    });
  });

  test("lists, a quote and a rule", async () => {
    const screen = await renderIn("light", RichText, {
      content: doc(
        find("list", (n) => n.listType === "bullet"),
        find("list", (n) => n.listType === "number"),
        find("quote"),
        find("horizontalrule"),
      ),
    });
    const [bullets, numbers] = screen.getByRole("list").elements();
    expect(bullets.tagName).toBe("UL");
    expect(numbers.tagName).toBe("OL");
    expect(
      screen
        .getByRole("listitem")
        .elements()
        .map((li) => li.textContent?.trim()),
    ).toEqual(["Wind", "Altimeter", "Listen", "Read back"]);
    await expect
      .element(screen.getByRole("blockquote"))
      .toHaveTextContent("Cleared to land.");
    await expect.element(screen.getByRole("separator")).toBeInTheDocument();
  });

  // Payload's editor has indent off, so it can't nest a list: this is the
  // fixture's bullet list with lists nested by hand, as Lexical saves them
  // (each nested list in an item of its own, after its parent).
  test("a deep nested list sits inside the item above it", async () => {
    const bullets = find("list", (n) => n.listType === "bullet");
    const nest = (list: SerializedNode, inner: SerializedNode) => ({
      ...list,
      children: [
        ...(list.children as SerializedNode[]).slice(0, 1),
        { type: "listitem", children: [inner] },
        ...(list.children as SerializedNode[]).slice(1),
      ],
    });
    const numbers = find("list", (n) => n.listType === "number");
    const deep = nest(bullets, nest(numbers, structuredClone(bullets)));
    const screen = await renderIn("light", RichText, { content: doc(deep) });

    // ul > li "Wind" > ol > li "Listen" > ul > li "Wind".
    const outer = screen.getByRole("list").first();
    const wind = outer.getByRole("listitem").first();
    const middle = wind.getByRole("list").first();
    const listen = middle.getByRole("listitem").first();
    const inner = listen.getByRole("list");
    expect(middle.element().tagName).toBe("OL");
    await expect.element(inner).toHaveTextContent("WindAltimeter");
    // Each level's own items: no empty item where Lexical kept the nesting.
    const own = (list: Element) =>
      [...list.children].map((li) => li.textContent?.slice(0, 6));
    expect(own(outer.element())).toEqual(["WindLi", "Altime"]);
    expect(own(middle.element())).toEqual(["Listen", "Read b"]);
  });

  test("a checklist is a list of checkboxes named by their text, all unticked, that readers tick", async () => {
    const screen = await renderIn("light", RichText, {
      content: doc(find("list", (n) => n.listType === "check")),
    });
    const list = screen.getByRole("list");
    // The author left "ATIS current" ticked.
    const atis = list.getByRole("checkbox", { name: "ATIS current" });
    const wind = list.getByRole("checkbox", { name: "Wind checked" });
    await expect.element(atis).not.toBeChecked();
    await expect.element(wind).not.toBeChecked();
    await userEvent.click(screen.getByText("Wind checked"));
    await expect.element(wind).toBeChecked();
  });

  test("a table has its header row as head, header column as row headers, and its merged cell", async () => {
    const screen = await renderIn("light", RichText, {
      content: doc(find("table")),
    });
    const table = screen.getByRole("table");
    for (const name of ["Runway", "Length", "Use"]) {
      const header = table.getByRole("columnheader", { name });
      await expect.element(header).toHaveAttribute("scope", "col");
      expect(header.element().closest("thead")).not.toBeNull();
    }
    for (const name of ["5L", "23R"]) {
      const header = table.getByRole("rowheader", { name });
      await expect.element(header).toHaveAttribute("scope", "row");
      expect(header.element().closest("tbody")).not.toBeNull();
    }
    await expect
      .element(table.getByRole("cell", { name: "Closed for resurfacing" }))
      .toHaveAttribute("colspan", "2");
    await expect
      .element(table.getByRole("cell", { name: "11,200 ft" }))
      .not.toHaveAttribute("colspan");
    // Lexical's widths and colours are dropped, and a cell's lone
    // paragraph is its text.
    const el = table.element();
    expect(el.querySelector("[style], [width], colgroup, p")).toBeNull();
  });

  test("an image is one img with its sizes in srcset, the column's sizes, the original's size and alt", async () => {
    const screen = await renderIn("light", RichText, {
      content: doc(find("upload")),
    });
    const img = screen.getByRole("img", { name: "Runway 23 at KIND" });
    await expect
      .element(img)
      .toHaveAttribute("src", "/api/media/file/runway.png");
    await expect
      .element(img)
      .toHaveAttribute(
        "srcset",
        "/api/media/file/runway-400x300.png 400w, /api/media/file/runway.png 800w",
      );
    await expect
      .element(img)
      .toHaveAttribute("sizes", "(min-width: 65ch) 65ch, 100vw");
    await expect.element(img).toHaveAttribute("width", "800");
    await expect.element(img).toHaveAttribute("height", "600");
  });

  test("an upload that isn't an image is a link named by its file", async () => {
    const upload = find("upload");
    upload.value = {
      id: "<media-id>",
      url: "/api/media/file/sop.pdf",
      filename: "sop.pdf",
      mimeType: "application/pdf",
    };
    const screen = await renderIn("light", RichText, { content: doc(upload) });
    await expect
      .element(screen.getByRole("link", { name: "sop.pdf" }))
      .toHaveAttribute("href", "/api/media/file/sop.pdf");
  });

  describe("links", () => {
    const sentence = () => paragraphWith("Tower ");

    test("a new-tab link opens in a new tab, with no opener", async () => {
      const screen = await renderIn("light", RichText, {
        content: doc(sentence()),
      });
      const link = screen.getByRole("link", { name: "clearance" });
      await expect
        .element(link)
        .toHaveAttribute(
          "href",
          "https://www.faa.gov/air_traffic/publications/atpubs/atc_html/chap3_section10.html",
        );
      await expect.element(link).toHaveAttribute("target", "_blank");
      await expect.element(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("an internal link goes where linkHref says, given the filled-in document", async () => {
      const linkHref = vi.fn(({ value }) =>
        value && typeof value === "object"
          ? `/lesson-plans/${value.code}`
          : undefined,
      );
      const screen = await renderIn("light", RichText, {
        content: doc(sentence()),
        linkHref,
      });
      const link = screen.getByRole("link", { name: "runway" });
      await expect
        .element(link)
        .toHaveAttribute("href", "/lesson-plans/X-TWR-0");
      await expect.element(link).not.toHaveAttribute("target");
      expect(linkHref).toHaveBeenCalledWith({
        label: "X-TWR-0",
        relationTo: "lesson-plans",
        value: { id: "<plan-id>", code: "X-TWR-0", title: "Before" },
      });
    });

    test("with no linkHref, an internal link is its text, never href=#", async () => {
      const screen = await renderIn("light", RichText, {
        content: doc(sentence()),
      });
      await expect
        .element(screen.getByRole("link", { name: "runway" }))
        .not.toBeInTheDocument();
      await expect.element(screen.getByText(/every runway\./)).toBeVisible();
      expect(screen.container.querySelector('a[href="#"]')).toBeNull();
    });

    test("a link to a deleted document, null, is its text when linkHref gives undefined", async () => {
      const p = sentence();
      const link = (p.children as SerializedNode[]).find(
        (n) => n.type === "link" && JSON.stringify(n).includes("internal"),
      )!;
      (link.fields as { doc: { value: unknown } }).doc.value = null;
      const linkHref = vi.fn(({ value }) => (value ? "/somewhere" : undefined));
      const screen = await renderIn("light", RichText, {
        content: doc(p),
        linkHref,
      });
      expect(linkHref).toHaveBeenCalledWith(
        expect.objectContaining({ value: null }),
      );
      await expect
        .element(screen.getByRole("link", { name: "runway" }))
        .not.toBeInTheDocument();
      await expect.element(screen.getByText(/every runway\./)).toBeVisible();
    });
  });

  describe("unknown nodes", () => {
    // A relationship node: Payload's feature is off, but an old body may
    // still hold one.
    test("one with children draws them, and warns", async () => {
      const screen = await renderIn("light", RichText, {
        content: doc({
          type: "mystery",
          children: [paragraph(text("Still here."))],
        }),
      });
      await expect.element(screen.getByText("Still here.")).toBeVisible();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"mystery"'));
    });

    test("one without draws nothing, and warns", async () => {
      const screen = await renderIn("light", RichText, {
        content: doc({ type: "relationship", value: { id: "<plan-id>" } }),
      });
      expectNothingDrawn(screen.getByRole("article").element());
      expect(warn).toHaveBeenCalledWith(
        expect.stringContaining('"relationship"'),
      );
    });

    test("a block with no snippet draws nothing, and warns", async () => {
      const screen = await renderIn("light", RichText, {
        content: doc(find("block")),
      });
      expectNothingDrawn(screen.getByRole("article").element());
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('"callout"'));
    });
  });

  describe("blocks", () => {
    const callout = () =>
      find(
        "block",
        (n) => (n.fields as { blockType: string }).blockType === "callout",
      );

    test("a block's snippet gets its fields, without id, blockName or blockType, and its content drawn", async () => {
      const screen = await renderIn("light", RichTextWithBlocks, {
        content: doc(callout()),
      });
      const block = screen.getByRole("complementary", { name: "Block" });
      await expect
        .element(block.getByRole("code"))
        .toHaveTextContent('label: "Wake turbulence"; level: "caution"');
      // The content, with the citation in it drawn by its own snippet.
      await expect
        .element(block.getByText(/^Hold departures behind a heavy/))
        .toBeVisible();
      await expect
        .element(block.getByText(/^at: "3-9-6"; source: /))
        .toBeVisible();
    });

    test("null fields reach the snippet as undefined", async () => {
      const block = callout();
      Object.assign(block.fields as object, { label: null });
      const position = structuredClone(
        (paragraphWith("Contact tower").children as SerializedNode[]).find(
          (n) => JSON.stringify(n).includes("IND_TWR"),
        )!,
      );
      Object.assign(position.fields as object, {
        airportAt: null,
        airport: { code: null, name: null },
      });
      const screen = await renderIn("light", RichTextWithBlocks, {
        content: doc(block, paragraph(position)),
      });
      await expect
        .element(screen.getByRole("code"))
        .toHaveTextContent('label: undefined; level: "caution"');
      // Nested too: JSON leaves undefined out.
      await expect
        .element(screen.getByText(/^show: /))
        .toHaveTextContent(
          'show: ["airport"]; airport: {}; callsign: "IND_TWR"; airportAt: undefined',
        );
    });

    test("an inline block sits in its paragraph", async () => {
      const screen = await renderIn("light", RichTextWithBlocks, {
        content: doc(paragraphWith("Contact tower")),
      });
      const p = screen.getByText(/^Contact tower on/);
      await expect.element(p.getByText(/^value: "120.900"$/)).toBeVisible();
      await expect.element(p.getByText(/^category: "MVFR"$/)).toBeVisible();
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
