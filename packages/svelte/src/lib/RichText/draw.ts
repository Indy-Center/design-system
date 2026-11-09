// What RichText draws for each node, as plain functions: the elements a
// text node's formats take, alignment, a block's cleaned fields, a list's
// items with their nested lists, a table's head and body, an upload, a
// link's address.
import type {
  BlockNodeFields,
  ElementFormat,
  LinkDocument,
  LinkFields,
  ListItemNode,
  ListNode,
  SerializedNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  UploadDocument,
  UploadNode,
} from "./nodes.js";

/** Lexical's text format bits, outermost first, and the element each writes. */
const FORMATS = [
  [1, "strong"],
  [2, "em"],
  [8, "u"],
  [4, "s"],
  [32, "sub"],
  [64, "sup"],
  [16, "code"],
] as const;

export type TextTag = (typeof FORMATS)[number][1];

/** The elements a text node's `format` wraps it in, outermost first. */
export function textTags(format: number | undefined): TextTag[] {
  return FORMATS.filter(([bit]) => ((format ?? 0) & bit) !== 0).map(
    ([, tag]) => tag,
  );
}

/** `data-align` for an element's format; none for the default. */
export function align(
  format: ElementFormat | undefined,
): "center" | "end" | "justify" | undefined {
  if (format === "center" || format === "justify") return format;
  if (format === "right" || format === "end") return "end";
  return undefined;
}

/** `value` with every `null` in it, at any depth, as `undefined`. */
function withoutNulls(value: unknown): unknown {
  if (value === null) return undefined;
  if (Array.isArray(value)) return value.map(withoutNulls);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [key, withoutNulls(v)]),
    );
  }
  return value;
}

/**
 * A block's fields as its snippet gets them: no `id`, `blockName` or
 * `blockType`, and `null` as `undefined` at any depth. `content` is left
 * out: RichText draws it and hands the snippet that instead.
 */
export function blockFields(fields: BlockNodeFields): Record<string, unknown> {
  const {
    id: _id,
    blockName: _blockName,
    blockType: _blockType,
    content: _content,
    ...rest
  } = fields;
  return withoutNulls(rest) as Record<string, unknown>;
}

/** A list item to draw: its own content, then any lists nested under it. */
export type ListEntry = {
  item: ListItemNode;
  children: SerializedNode[];
  lists: ListNode[];
};

const isList = (node: SerializedNode) => node.type === "list";

/**
 * A list's items, each with the lists nested under it. Lexical keeps a
 * nested list in an item of its own after its parent; this puts it inside
 * the parent, where HTML has it. One with no item before it stays alone.
 */
export function listEntries(list: ListNode): ListEntry[] {
  const entries: ListEntry[] = [];
  for (const node of list.children) {
    const item = node as unknown as ListItemNode;
    const children = item.children ?? [];
    const nestedOnly = children.length > 0 && children.every(isList);
    const previous = entries.at(-1);
    if (nestedOnly && previous) {
      previous.lists.push(...(children as unknown as ListNode[]));
      continue;
    }
    entries.push({
      item,
      children: children.filter((child) => !isList(child)),
      lists: children.filter(isList) as unknown as ListNode[],
    });
  }
  return entries;
}

/** A table cell to draw. */
export type Cell = {
  cell: TableCellNode;
  /** `th` for a header cell, with its `scope`. */
  scope?: "col" | "row";
  colspan?: number;
  rowspan?: number;
  /** What it holds: a lone paragraph's own content, without the `<p>`. */
  children: SerializedNode[];
};

const ROW_HEADER = 1;
const COLUMN_HEADER = 2;

function cellOf(node: SerializedNode, inHead: boolean): Cell {
  const cell = node as unknown as TableCellNode;
  const state = cell.headerState ?? 0;
  const scope = inHead
    ? "col"
    : state & COLUMN_HEADER
      ? "row"
      : state & ROW_HEADER
        ? "col"
        : undefined;
  const children = cell.children ?? [];
  const lone = children.length === 1 && children[0].type === "paragraph";
  return {
    cell,
    scope,
    colspan: (cell.colSpan ?? 1) > 1 ? cell.colSpan : undefined,
    rowspan: (cell.rowSpan ?? 1) > 1 ? cell.rowSpan : undefined,
    children: lone
      ? ((children[0].children as SerializedNode[] | undefined) ?? [])
      : children,
  };
}

/**
 * A table's rows, split into its head (the leading rows whose every cell is
 * a header row's) and its body.
 */
export function tableParts(table: TableNode): {
  head: Cell[][];
  body: Cell[][];
} {
  const rows = table.children.map(
    (row) => (row as unknown as TableRowNode).children ?? [],
  );
  const inHead = (cells: SerializedNode[]) =>
    cells.length > 0 &&
    cells.every(
      (cell) =>
        ((cell as unknown as TableCellNode).headerState ?? 0) & ROW_HEADER,
    );
  let split = 0;
  while (split < rows.length && inHead(rows[split])) split++;
  return {
    head: rows
      .slice(0, split)
      .map((cells) => cells.map((c) => cellOf(c, true))),
    body: rows.slice(split).map((cells) => cells.map((c) => cellOf(c, false))),
  };
}

/** The resized copies an image's `srcset` lists, smallest first; `logo` is left out. */
const SRCSET_SIZES = ["thumbnail", "large", "banner"];

/** The reading column's width, for an image's `sizes`: Prose's 65ch. */
export const READING_SIZES = "(min-width: 65ch) 65ch, 100vw";

export type UploadDrawing =
  | {
      kind: "image";
      src: string;
      srcset?: string;
      width?: number;
      height?: number;
      alt: string;
    }
  | { kind: "file"; href: string; name: string }
  | { kind: "none" };

/**
 * How to draw an upload: an image with its resized copies, a link to any
 * other file by its name, or nothing for one Payload didn't fill in.
 */
export function uploadDrawing(node: UploadNode): UploadDrawing {
  const file = node.value;
  if (typeof file !== "object" || file === null || !file.url) {
    return { kind: "none" };
  }
  if (!isImage(file)) {
    return {
      kind: "file",
      href: file.url,
      name: file.filename || file.url.split("/").at(-1) || file.url,
    };
  }
  const candidates = [
    ...SRCSET_SIZES.map((name) => file.sizes?.[name]),
    { url: file.url, width: file.width },
  ].filter((size) => size?.url && size.width) as {
    url: string;
    width: number;
  }[];
  const widths = new Set<number>();
  const srcset = candidates
    .sort((a, b) => a.width - b.width)
    .filter(({ width }) => !widths.has(width) && widths.add(width))
    .map(({ url, width }) => `${url} ${width}w`)
    .join(", ");
  return {
    kind: "image",
    src: file.url,
    srcset: srcset || undefined,
    width: file.width ?? undefined,
    height: file.height ?? undefined,
    alt: file.alt ?? "",
  };
}

function isImage(file: UploadDocument): boolean {
  if (file.mimeType) return file.mimeType.startsWith("image/");
  // Payload records a width and height for images alone.
  return typeof file.width === "number" && typeof file.height === "number";
}

/** Gives an internal link's address, or `undefined` to draw its text plain. */
export type LinkHrefFunction = (doc: LinkDocument) => string | undefined;

/**
 * A link's address: its URL, or for an internal link what `linkHref`
 * gives. `undefined` draws the link's text plain.
 */
export function linkAddress(
  fields: LinkFields,
  linkHref: LinkHrefFunction | undefined,
): string | undefined {
  if (fields.linkType === "internal") {
    return fields.doc && linkHref
      ? linkHref(fields.doc) || undefined
      : undefined;
  }
  return fields.url || undefined;
}
