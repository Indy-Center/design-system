<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Prose from "../Prose/Prose.svelte";
  import type { BlockSnippets } from "./blockSnippets.js";
  import type { LinkHrefFunction } from "./draw.js";
  import {
    documentHeadings,
    headingId as slugId,
    type HeadingIdFunction,
  } from "./headings.js";
  import type { RichTextState } from "./nodes.js";
  import Nodes, { type Drawing } from "./DrawNodes.svelte";
  import { PACKAGE_BLOCKS } from "./packageBlocks.svelte";

  type Props = Omit<ComponentProps<typeof Prose>, "children"> & {
    /** The rich-text field's value as Payload sends it; nothing is drawn for none. */
    content: RichTextState | null | undefined;
    /** Snippets for blocks and inline blocks, by slug; one replaces the package's own. */
    blocks?: BlockSnippets;
    /** An internal link's address; with none, or `undefined` back, its text is drawn plain. */
    linkHref?: LinkHrefFunction;
    /** A heading's id from its text, in place of the package's slug. */
    headingId?: HeadingIdFunction;
  };

  let {
    content,
    blocks = {},
    linkHref,
    headingId = slugId,
    ...rest
  }: Props = $props();

  const drawing: Drawing = $derived({
    // Each snippet takes its own fields; the drawing hands it whatever the
    // block's JSON holds, so the types are met only by the cast.
    blocks: { ...PACKAGE_BLOCKS, ...blocks } as unknown as Drawing["blocks"],
    linkHref,
    ids: new Map(
      documentHeadings(content, headingId).map(({ node, id }) => [node, id]),
    ),
  });
</script>

<Prose {...rest}>
  {#if content}<Nodes nodes={content.root.children} {drawing} />{/if}
</Prose>
