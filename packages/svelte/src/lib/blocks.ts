// The blocks contract, for Payload's block configs:
// import { BLOCKS, type BlockFieldTypes } from "@indy-center/centerline-svelte/blocks";
//
// Plain TypeScript with no Svelte import, so the CMS reads it with no
// Svelte installed. Each block the package draws adds, in alphabetical
// order: its field type, a line in `BlockFieldTypes`, a line in `BLOCKS`,
// any option lists its selects need, a snippet in
// `RichText/packageBlocks.svelte`, a check in `RichText/blocks.test.ts` and
// a row in `RichText/RichText.md`'s Blocks section.
export type { RichTextState } from "./RichText/nodes.js";

/** Where a block sits: on a line of its own, or inline in a paragraph. */
export type BlockKind = "block" | "inline";

/**
 * Each block the package draws, by slug: its fields as Payload sends them,
 * without `id`, `blockName` and `blockType`. An optional field may be
 * `null`; nested rich text is a `content: RichTextState` field.
 */
export interface BlockFieldTypes {
  // One line per block, alphabetical: `callout: CalloutBlock;`
}

/** A slug the package draws. */
export type BlockSlug = keyof BlockFieldTypes;

/**
 * Each slug the package draws, block or inline: Payload's `BlocksFeature`
 * lists the first under `blocks` and the second under `inlineBlocks`.
 */
export const BLOCKS = {
  // One line per block, alphabetical: `callout: "block",`
} as const satisfies { [Slug in BlockSlug]: BlockKind };

// The option lists Payload's selects need, each beside its block's type.
