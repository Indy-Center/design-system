<script lang="ts">
  import { DEV } from "esm-env";
  import type { HTMLAttributes } from "svelte/elements";
  import { findPilotRating, findRating } from "../aviation/ratings.js";
  import AbbrTooltip from "../AbbrTooltip/AbbrTooltip.svelte";
  import Chip from "../Chip/Chip.svelte";

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** The rating as the data source spells it: `5`, `"C1"` or `"Controller1"`; for a pilot, `3` or `"IR"`. */
    rating: number | string;
    /** Whose rating it is: a controller's (the default) or a pilot's. */
    kind?: "controller" | "pilot";
    /** Whether it is a tab stop, for places with few ratings (a member's menu, a profile). */
    focusable?: boolean;
  };

  let {
    rating,
    kind = "controller",
    focusable = false,
    class: className,
    ...rest
  }: Props = $props();

  const found = $derived(
    kind === "pilot" ? findPilotRating(rating) : findRating(rating),
  );

  $effect(() => {
    if (DEV && !found)
      console.warn(`Rating: ${JSON.stringify(rating)} is no ${kind} rating`);
  });
</script>

{#if found}
  <AbbrTooltip
    code={found.short}
    name={found.long}
    {focusable}
    boxClass={className}
  >
    {#snippet frame(abbr, ring)}
      <Chip {...rest} variant="muted" class={ring}>{@render abbr()}</Chip>
    {/snippet}
  </AbbrTooltip>
{:else}
  <Chip {...rest} variant="muted" class={className}>{rating}</Chip>
{/if}
