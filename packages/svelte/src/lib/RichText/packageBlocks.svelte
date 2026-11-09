<script module lang="ts">
  // The package's own block snippets, by slug. Each block the package
  // draws adds its snippet below and a line here, alphabetical; the type
  // asks for one per slug in `BlockFieldTypes` (../blocks.ts). An app's
  // snippet for the same slug replaces it.
  import type { Snippet } from "svelte";
  import type { BlockFieldTypes, BlockSlug } from "../blocks.js";
  import type { BlockProps } from "./blockSnippets.js";

  export const PACKAGE_BLOCKS: {
    [Slug in BlockSlug]: Snippet<[BlockProps<BlockFieldTypes[Slug]>]>;
  } = {
    // One line per block, alphabetical: `callout,`
  };
</script>

<!--
  One snippet per block, alphabetical, drawing its component:
  {#snippet callout({ content, ...fields }: BlockProps<CalloutBlock>)}
    <Callout {...fields}>{@render content()}</Callout>
  {/snippet}
-->
