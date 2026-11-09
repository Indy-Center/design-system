<script lang="ts">
  import {
    RichText,
    setPositions,
    type LinkHrefFunction,
  } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import { inlineBlocksBody } from "../../playground/inlineBlocks.ts";
  import { samplePositions } from "../../playground/positions.ts";
  import {
    lessonPlanBody,
    phraseologyBody,
  } from "../../playground/richText.ts";

  // An app's layout sets the positions the inline blocks look up.
  setPositions(() => samplePositions);

  // An app's own addresses for the CMS documents a body links to.
  const linkHref: LinkHrefFunction = ({ value }) =>
    value && typeof value === "object" && "code" in value
      ? `?plan=${value.code}`
      : undefined;
</script>

<Schemes>
  <RichText content={lessonPlanBody} {linkHref} />
</Schemes>

{#snippet phraseology({ words }: { words?: string })}
  <p class="font-mono">{words}</p>
{/snippet}

<h2 class="mt-8 mb-4 font-heading text-xl font-semibold text-foreground">
  An app's own block
</h2>
<Schemes>
  <RichText content={phraseologyBody} blocks={{ phraseology }} as="div" />
</Schemes>

<h2 class="mt-8 mb-4 font-heading text-xl font-semibold text-foreground">
  Inline blocks in a paragraph
</h2>
<Schemes>
  <RichText content={inlineBlocksBody} />
</Schemes>
