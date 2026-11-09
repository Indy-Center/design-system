// The serialized Lexical editor state Payload sends for a rich-text field,
// and the nodes RichText knows in it. Plain TypeScript with no Svelte
// import: the `blocks` entry re-exports `RichTextState` for the CMS.

/**
 * Any node, as Payload's generated types give it: a `type` and whatever
 * else. RichText narrows it by `type` to the nodes below.
 */
export type SerializedNode = { type: string; [key: string]: unknown };

/** A rich-text field's value: the editor state Payload saves and sends. */
export type RichTextState = {
  root: { children: SerializedNode[]; [key: string]: unknown };
  [key: string]: unknown;
};

/** Lexical's element alignment: `left` and `start` are the default. */
export type ElementFormat =
  "" | "left" | "start" | "center" | "right" | "end" | "justify";

type ElementNode = {
  children: SerializedNode[];
  format?: ElementFormat;
  indent?: number;
};

export type TextNode = {
  type: "text";
  text: string;
  /** Lexical's bit flags: bold 1, italic 2, strikethrough 4, underline 8, code 16, subscript 32, superscript 64. */
  format: number;
};

/** A tab character, drawn as text. */
export type TabNode = { type: "tab"; text: string; format?: number };

export type LineBreakNode = { type: "linebreak" };

export type ParagraphNode = ElementNode & { type: "paragraph" };

export type HeadingNode = ElementNode & {
  type: "heading";
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
};

export type QuoteNode = ElementNode & { type: "quote" };

export type ListNode = ElementNode & {
  type: "list";
  listType: "bullet" | "number" | "check";
  start?: number;
};

export type ListItemNode = ElementNode & {
  type: "listitem";
  /** A checklist item's box as the author left it; never drawn. */
  checked?: boolean;
};

export type HorizontalRuleNode = { type: "horizontalrule" };

/**
 * A linked CMS document, as `linkHref` gets it: `value` is the document
 * Payload filled in, its id when it didn't, or `null` once it is deleted.
 */
export type LinkDocument = {
  relationTo: string;
  value: string | number | Record<string, unknown> | null;
};

export type LinkFields = {
  linkType?: "custom" | "internal";
  url?: string | null;
  newTab?: boolean | null;
  doc?: LinkDocument | null;
};

/** A link, or a URL the editor turned into one as it was typed. */
export type LinkNode = ElementNode & {
  type: "link" | "autolink";
  fields: LinkFields;
};

/** One of an upload's resized copies; a size Payload didn't make is all null. */
export type UploadSize = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  mimeType?: string | null;
  filename?: string | null;
};

/** An uploaded file, as Payload fills it in. */
export type UploadDocument = {
  url?: string | null;
  alt?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  width?: number | null;
  height?: number | null;
  sizes?: Record<string, UploadSize | null | undefined> | null;
};

export type UploadNode = {
  type: "upload";
  relationTo: string;
  /** The filled-in file, or its id when Payload didn't fill it in. */
  value: UploadDocument | string | number | null;
};

export type TableNode = ElementNode & { type: "table" };

export type TableRowNode = ElementNode & { type: "tablerow" };

export type TableCellNode = ElementNode & {
  type: "tablecell";
  /** Lexical's bits: 1 a header row's cell, 2 a header column's, 3 both (the corner). */
  headerState?: number;
  colSpan?: number;
  rowSpan?: number;
};

/** A block's fields as Payload sends them, before RichText cleans them. */
export type BlockNodeFields = {
  id?: string;
  blockType: string;
  blockName?: string;
  [field: string]: unknown;
};

export type BlockNode = { type: "block"; fields: BlockNodeFields };

export type InlineBlockNode = { type: "inlineBlock"; fields: BlockNodeFields };
