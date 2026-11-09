import { describe, expect, test } from "vitest";
import {
  align,
  blockFields,
  linkAddress,
  listEntries,
  tableParts,
  textTags,
  uploadDrawing,
} from "./draw.ts";
import type {
  ElementFormat,
  ListNode,
  TableNode,
  UploadNode,
} from "./nodes.ts";

describe("textTags", () => {
  test.each<[number, string[]]>([
    [0, []],
    [1, ["strong"]],
    [2, ["em"]],
    [4, ["s"]],
    [8, ["u"]],
    [16, ["code"]],
    [32, ["sub"]],
    [64, ["sup"]],
    // Highlight (128) has no element.
    [128, []],
    [1 | 2 | 8, ["strong", "em", "u"]],
    [1 | 16, ["strong", "code"]],
  ])("format %i is %j", (format, tags) => {
    expect(textTags(format)).toEqual(tags);
  });
});

describe("align", () => {
  test.each<[ElementFormat | undefined, string | undefined]>([
    [undefined, undefined],
    ["", undefined],
    ["left", undefined],
    ["start", undefined],
    ["center", "center"],
    ["right", "end"],
    ["end", "end"],
    ["justify", "justify"],
  ])("%j is %j", (format, dataAlign) => {
    expect(align(format)).toBe(dataAlign);
  });
});

describe("blockFields", () => {
  test("drops id, blockName, blockType and content, and turns null into undefined at any depth", () => {
    expect(
      blockFields({
        id: "65f0",
        blockName: "",
        blockType: "position",
        callsign: "IND_TWR",
        airportAt: null,
        show: ["airport", null],
        airport: { code: null, name: null },
        content: { root: { children: [] } },
      }),
    ).toEqual({
      callsign: "IND_TWR",
      airportAt: undefined,
      show: ["airport", undefined],
      airport: { code: undefined, name: undefined },
    });
  });
});

const item = (text: string) => ({
  type: "listitem",
  children: [{ type: "text", text, format: 0 }],
});
const list = (
  ...children: { type: string; [key: string]: unknown }[]
): ListNode => ({ type: "list", listType: "bullet", children });
const nestedItem = (...lists: ListNode[]) => ({
  type: "listitem",
  children: lists,
});

describe("listEntries", () => {
  test("puts a nested list inside the item before it", () => {
    const inner = list(item("Gusts"));
    const entries = listEntries(
      list(item("Wind"), nestedItem(inner), item("Altimeter")),
    );
    expect(entries.map((e) => [e.children[0].text, e.lists])).toEqual([
      ["Wind", [inner]],
      ["Altimeter", []],
    ]);
  });

  test("keeps a nested list with no item before it in an item of its own", () => {
    const inner = list(item("Gusts"));
    const entries = listEntries(list(nestedItem(inner), item("Wind")));
    expect(entries.map((e) => [e.children.length, e.lists])).toEqual([
      [0, [inner]],
      [1, []],
    ]);
  });
});

const cell = (text: string, headerState: number, colSpan = 1) => ({
  type: "tablecell",
  headerState,
  colSpan,
  rowSpan: 1,
  children: [{ type: "paragraph", children: [{ type: "text", text }] }],
});
const row = (...children: ReturnType<typeof cell>[]) => ({
  type: "tablerow",
  children,
});

describe("tableParts", () => {
  test("a header row is the head, its cells col headers; a header column's cells are row headers; a merged cell keeps its span", () => {
    const table: TableNode = {
      type: "table",
      children: [
        row(cell("Runway", 3), cell("Length", 1)),
        row(cell("5L", 2), cell("11,200 ft", 0)),
        row(cell("23R", 2), cell("Closed", 0, 2)),
      ],
    };
    const summary = (cells: ReturnType<typeof tableParts>["head"]) =>
      cells.map((r) => r.map((c) => [c.children[0].text, c.scope, c.colspan]));
    const { head, body } = tableParts(table);
    expect(summary(head)).toEqual([
      [
        ["Runway", "col", undefined],
        ["Length", "col", undefined],
      ],
    ]);
    expect(summary(body)).toEqual([
      [
        ["5L", "row", undefined],
        ["11,200 ft", undefined, undefined],
      ],
      [
        ["23R", "row", undefined],
        ["Closed", undefined, 2],
      ],
    ]);
  });

  test("a table with no header row has no head", () => {
    const { head, body } = tableParts({
      type: "table",
      children: [row(cell("A", 0)), row(cell("B", 0))],
    });
    expect(head).toEqual([]);
    expect(body).toHaveLength(2);
  });

  test("a cell with more than one paragraph keeps them", () => {
    const two = {
      ...cell("A", 0),
      children: [
        { type: "paragraph", children: [] },
        { type: "paragraph", children: [] },
      ],
    };
    const { body } = tableParts({ type: "table", children: [row(two)] });
    expect(body[0][0].children.map((c) => c.type)).toEqual([
      "paragraph",
      "paragraph",
    ]);
  });
});

const upload = (value: UploadNode["value"]): UploadNode => ({
  type: "upload",
  relationTo: "media",
  value,
});
const none = { url: null, width: null, height: null };

describe("uploadDrawing", () => {
  test("an image lists its sizes and itself in srcset, smallest first, without logo or a size Payload didn't make", () => {
    expect(
      uploadDrawing(
        upload({
          url: "/m/runway.png",
          alt: "Runway 23",
          width: 800,
          height: 600,
          sizes: {
            logo: { url: "/m/runway-256.png", width: 256, height: 192 },
            thumbnail: { url: "/m/runway-400.png", width: 400, height: 300 },
            large: none,
            banner: none,
          },
        }),
      ),
    ).toEqual({
      kind: "image",
      src: "/m/runway.png",
      srcset: "/m/runway-400.png 400w, /m/runway.png 800w",
      width: 800,
      height: 600,
      alt: "Runway 23",
    });
  });

  test("a large image takes every size, and lists a width once", () => {
    const drawing = uploadDrawing(
      upload({
        url: "/m/a.png",
        alt: "",
        width: 2400,
        height: 1200,
        sizes: {
          thumbnail: { url: "/m/a-400.png", width: 400 },
          large: { url: "/m/a-1600.png", width: 1600 },
          banner: { url: "/m/a-2400.png", width: 2400 },
        },
      }),
    );
    expect(drawing).toMatchObject({
      srcset: "/m/a-400.png 400w, /m/a-1600.png 1600w, /m/a-2400.png 2400w",
    });
  });

  test("a file that isn't an image is a link named by its file name", () => {
    expect(
      uploadDrawing(
        upload({
          url: "/m/sop.pdf",
          filename: "sop.pdf",
          mimeType: "application/pdf",
        }),
      ),
    ).toEqual({ kind: "file", href: "/m/sop.pdf", name: "sop.pdf" });
    // With no type and no size, it's no image either.
    expect(uploadDrawing(upload({ url: "/m/notes.txt" }))).toEqual({
      kind: "file",
      href: "/m/notes.txt",
      name: "notes.txt",
    });
  });

  test("an upload Payload didn't fill in draws nothing", () => {
    expect(uploadDrawing(upload("<media-id>"))).toEqual({ kind: "none" });
    expect(uploadDrawing(upload(null))).toEqual({ kind: "none" });
  });
});

describe("linkAddress", () => {
  const doc = { relationTo: "lesson-plans", value: { id: "1", slug: "taxi" } };
  const linkHref = ({ value }: { value: unknown }) =>
    value && typeof value === "object" && "slug" in value
      ? `/plans/${value.slug}`
      : undefined;

  test.each<[string, Parameters<typeof linkAddress>, string | undefined]>([
    [
      "a custom link, its URL",
      [{ linkType: "custom", url: "https://a.b" }, undefined],
      "https://a.b",
    ],
    [
      "a custom link with no URL, plain",
      [{ linkType: "custom", url: "" }, undefined],
      undefined,
    ],
    [
      "an internal link, linkHref's address",
      [{ linkType: "internal", doc }, linkHref],
      "/plans/taxi",
    ],
    [
      "an internal link with no linkHref, plain",
      [{ linkType: "internal", doc }, undefined],
      undefined,
    ],
    [
      "an internal link to a deleted document, plain",
      [
        {
          linkType: "internal",
          doc: { relationTo: "lesson-plans", value: null },
        },
        linkHref,
      ],
      undefined,
    ],
    [
      'an internal link linkHref gives "", plain',
      [{ linkType: "internal", doc }, () => ""],
      undefined,
    ],
  ])("%s", (_, args, href) => {
    expect(linkAddress(...args)).toBe(href);
  });
});
