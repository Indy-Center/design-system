import { describe, expect, test } from "vitest";
import body from "../../playground/lesson-plan-body.json" with { type: "json" };
import { documentHeadings, headingId } from "./headings.ts";
import type { RichTextState, SerializedNode } from "./nodes.ts";

const text = (s: string, format = 0): SerializedNode => ({
  type: "text",
  text: s,
  format,
});
const heading = (tag: string, ...children: SerializedNode[]) => ({
  type: "heading",
  tag,
  children,
});
const doc = (...children: SerializedNode[]): RichTextState => ({
  root: { type: "root", children },
});

describe("headingId", () => {
  test.each([
    ["Runways", "runways"],
    ["Hold short", "hold-short"],
    ["  Taxi -- and   hold  ", "taxi-and-hold"],
    ["Pilot's view", "pilots-view"],
    ["Pilot’s view", "pilots-view"],
    ["Café à la carte", "cafe-a-la-carte"],
    ["3-7-2 Wake turbulence", "3-7-2-wake-turbulence"],
    ["KIND / KSDF", "kind-ksdf"],
    ["Ünïcödé", "unicode"],
    ["Привет мир", "привет-мир"],
    ["!!!", "section"],
    ["", "section"],
  ])("%j is %j", (heading, id) => {
    expect(headingId(heading)).toBe(id);
  });
});

describe("documentHeadings", () => {
  test("the fixture's h2–h4, in order", () => {
    expect(
      documentHeadings(body as RichTextState).map(({ level, text, id }) => ({
        level,
        text,
        id,
      })),
    ).toEqual([
      { level: 2, text: "Runways", id: "runways" },
      { level: 3, text: "Hold short", id: "hold-short" },
      { level: 4, text: "Notes", id: "notes" },
    ]);
  });

  test("reads a heading's text across its formatting, links and line breaks", () => {
    const [found] = documentHeadings(
      doc(
        heading(
          "h2",
          text("Hold "),
          text("short", 1),
          { type: "linebreak" },
          { type: "link", fields: {}, children: [text("lines")] },
        ),
      ),
    );
    expect(found).toMatchObject({
      text: "Hold short lines",
      id: "hold-short-lines",
    });
  });

  test("a repeated id gets -2, -3, skipping one a heading already has", () => {
    const ids = documentHeadings(
      doc(
        heading("h2", text("Notes")),
        heading("h3", text("Notes-2")),
        heading("h3", text("Notes")),
        heading("h3", text("Notes")),
      ),
    ).map((h) => h.id);
    expect(ids).toEqual(["notes", "notes-2", "notes-3", "notes-4"]);
  });

  test("counts headings in a block's content, where they fall", () => {
    const ids = documentHeadings(
      doc(
        heading("h2", text("Notes")),
        {
          type: "block",
          fields: {
            blockType: "callout",
            content: doc(heading("h3", text("Notes"))),
          },
        },
        heading("h2", text("Notes")),
      ),
    ).map((h) => h.id);
    expect(ids).toEqual(["notes", "notes-2", "notes-3"]);
  });

  test("an app's headingId replaces the slug, and still gets -2 on a repeat", () => {
    const ids = documentHeadings(
      doc(heading("h2", text("Runways")), heading("h2", text("Taxiways"))),
      (text, node) => `${node.tag}-${text.length > 7 ? "long" : "short"}`,
    ).map((h) => h.id);
    expect(ids).toEqual(["h2-short", "h2-long"]);

    const repeated = documentHeadings(
      doc(heading("h2", text("A")), heading("h2", text("B"))),
      () => "same",
    ).map((h) => h.id);
    expect(repeated).toEqual(["same", "same-2"]);
  });

  test("no content has no headings", () => {
    expect(documentHeadings(null)).toEqual([]);
    expect(documentHeadings(undefined)).toEqual([]);
  });
});
