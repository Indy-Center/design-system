// The blocks contract, for Payload's block configs:
// import { BLOCKS, type BlockFieldTypes } from "@indy-center/centerline-svelte/blocks";
//
// Plain TypeScript with no Svelte import, so the CMS reads it with no
// Svelte installed. Each block the package draws adds, in alphabetical
// order: its field type, a line in `BlockFieldTypes`, a line in `BLOCKS`,
// any option lists its selects need, a snippet in
// `RichText/packageBlocks.svelte`, a check in `RichText/blocks.test.ts` and
// a row in `RichText/RichText.md`'s Blocks section.
import type { RichTextState } from "./RichText/nodes.js";

export type { RichTextState };

/** Where a block sits: on a line of its own, or inline in a paragraph. */
export type BlockKind = "block" | "inline";

/** A callout: a note set apart in a document, drawn by `Callout`. */
export type CalloutBlock = {
  /** One of `CALLOUT_LEVELS`. */
  level: CalloutLevel;
  /** Shown in place of the level's own label ("Note"). */
  label?: string | null;
  /** The callout's text. */
  content: RichTextState;
};

/** A "show more" section, drawn by `Disclosure`. */
export type DisclosureBlock = {
  /** The line that is always shown: plain text. */
  summary: string;
  /** What it shows when open. */
  content: RichTextState;
};

/**
 * Each block the package draws, by slug: its fields as Payload sends them,
 * without `id`, `blockName` and `blockType`. An optional field may be
 * `null`; nested rich text is a `content: RichTextState` field.
 */
export interface BlockFieldTypes {
  // One line per block, alphabetical: `callout: CalloutBlock;`
  callout: CalloutBlock;
  disclosure: DisclosureBlock;
}

/** A slug the package draws. */
export type BlockSlug = keyof BlockFieldTypes;

/**
 * Each slug the package draws, block or inline: Payload's `BlocksFeature`
 * lists the first under `blocks` and the second under `inlineBlocks`.
 */
export const BLOCKS = {
  // One line per block, alphabetical: `callout: "block",`
  callout: "block",
  disclosure: "block",
} as const satisfies { [Slug in BlockSlug]: BlockKind };

// The option lists Payload's selects need, each beside its block's type.

/** A callout's levels: the FAA's NOTE, CAUTION, WARNING and REFERENCE. */
export const CALLOUT_LEVELS = [
  "info",
  "caution",
  "danger",
  "reference",
] as const;

/** How a callout reads: `info`, `caution`, `danger`, or `reference` (no colour). */
export type CalloutLevel = (typeof CALLOUT_LEVELS)[number];
