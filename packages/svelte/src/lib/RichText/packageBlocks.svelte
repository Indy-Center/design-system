<script module lang="ts">
  // The package's own block snippets, by slug. Each block the package
  // draws adds its snippet below and a line here, alphabetical; the type
  // asks for one per slug in `BlockFieldTypes` (../blocks.ts). An app's
  // snippet for the same slug replaces it.
  import type { Snippet } from "svelte";
  import type {
    BlockFieldTypes,
    BlockSlug,
    CalloutBlock,
    CitationBlock,
    DisclosureBlock,
  } from "../blocks.js";
  import Callout from "../Callout/Callout.svelte";
  import Citation from "../Citation/Citation.svelte";
  import Disclosure from "../Disclosure/Disclosure.svelte";
  import type { BlockProps } from "./blockSnippets.js";

  export const PACKAGE_BLOCKS: {
    [Slug in BlockSlug]: Snippet<[BlockProps<BlockFieldTypes[Slug]>]>;
  } = {
    // One line per block, alphabetical: `callout,`
    callout,
    citation,
    disclosure,
  };
</script>

<!--
  One snippet per block, alphabetical, drawing its component:
  {#snippet callout({ content, ...fields }: BlockProps<CalloutBlock>)}
    <Callout {...fields}>{@render content()}</Callout>
  {/snippet}
-->

<!-- my-5: a paragraph's gap, kept between two callouts in a row. -->
{#snippet callout({ content, ...fields }: BlockProps<CalloutBlock>)}
  <Callout {...fields} class="my-5">{@render content()}</Callout>
{/snippet}

{#snippet citation(fields: BlockProps<CitationBlock>)}
  <Citation {...fields} />
{/snippet}

<!-- The content's own margins stay between its parts, not at its edges. -->
{#snippet disclosure({ summary, content }: BlockProps<DisclosureBlock>)}
  {#snippet line()}{summary}{/snippet}
  <Disclosure summary={line}>
    <div class="*:first:mt-0 *:last:mb-0">{@render content()}</div>
  </Disclosure>
{/snippet}
