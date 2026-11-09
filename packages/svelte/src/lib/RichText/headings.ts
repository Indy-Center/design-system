// Heading ids: RichText writes them, and a contents list reads the same
// ones from the same JSON with `documentHeadings`.
import type {
  BlockNodeFields,
  HeadingNode,
  RichTextState,
  SerializedNode,
} from "./nodes.js";

/** Gives a heading its id from its text. An app's own replaces `headingId`. */
export type HeadingIdFunction = (text: string, heading: HeadingNode) => string;

/** A heading in a document, with the id RichText draws it with. */
export type DocumentHeading = {
  /** 1–6, from the heading's tag. */
  level: number;
  /** Its text, its spaces collapsed. */
  text: string;
  id: string;
  node: HeadingNode;
};

/**
 * The package's rule for a heading's id: a slug of its text. Lower case,
 * accents dropped, apostrophes dropped, any other run of characters that
 * aren't letters or digits as one hyphen. A heading with none is
 * `section`.
 */
export function headingId(text: string): string {
  const slug = text
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-|-$/g, "");
  return slug || "section";
}

/** The rich text in a block's `content` field, if it holds any. */
export function blockContent(
  fields: BlockNodeFields,
): RichTextState | undefined {
  const content = fields.content as RichTextState | null | undefined;
  return Array.isArray(content?.root?.children) ? content : undefined;
}

/** A node's text, as a heading's id and a contents list read it. */
export function textOf(node: SerializedNode): string {
  if (node.type === "text" || node.type === "tab") return String(node.text);
  if (node.type === "linebreak") return " ";
  const children = node.children;
  return Array.isArray(children)
    ? (children as SerializedNode[]).map(textOf).join("")
    : "";
}

/**
 * Every heading in `content`, in document order, blocks' nested `content`
 * included, with its id: `id(text, heading)` (`headingId` unless an app
 * gives its own), and `-2`, `-3` on for an id already taken.
 */
export function documentHeadings(
  content: RichTextState | null | undefined,
  id: HeadingIdFunction = headingId,
): DocumentHeading[] {
  const found: DocumentHeading[] = [];
  const taken = new Set<string>();

  function walk(nodes: SerializedNode[]) {
    for (const node of nodes) {
      if (node.type === "heading") {
        const heading = node as unknown as HeadingNode;
        const text = textOf(node).replace(/\s+/g, " ").trim();
        const base = id(text, heading);
        let unique = base;
        for (let n = 2; taken.has(unique); n++) unique = `${base}-${n}`;
        taken.add(unique);
        found.push({
          level: Number(heading.tag.slice(1)),
          text,
          id: unique,
          node: heading,
        });
      }
      if (Array.isArray(node.children)) walk(node.children as SerializedNode[]);
      if (node.type === "block" || node.type === "inlineBlock") {
        const nested = blockContent(node.fields as BlockNodeFields);
        if (nested) walk(nested.root.children);
      }
    }
  }

  if (content) walk(content.root.children);
  return found;
}
