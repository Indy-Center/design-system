<script lang="ts">
  import { DEV } from "esm-env";
  import type { HTMLAttributes } from "svelte/elements";
  import { findPilotRating, findRating } from "../aviation/ratings.js";
  import Chip from "../Chip/Chip.svelte";
  import Tooltip from "../Tooltip/Tooltip.svelte";

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
  <!-- The hidden text reads the long name, so the tooltip is hidden from
       screen readers and the trigger's aria-describedby left off: each would
       say it again. -->
  <Tooltip text={found.long} aria-hidden="true" class={className}>
    {#snippet children()}
      <!-- The focus lands on the abbr inside, but the ring goes round the
           chip. -->
      <Chip
        {...rest}
        variant="muted"
        class={[
          focusable &&
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
        ]}
      >
        <!-- When focusable, a keyboard can show the tooltip too. No title:
             some screen readers would say the long name twice. -->
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <abbr
          tabindex={focusable ? 0 : undefined}
          class="no-underline outline-none"
          >{found.short}<span class="sr-only">{" "}{found.long}</span></abbr
        >
      </Chip>
    {/snippet}
  </Tooltip>
{:else}
  <Chip {...rest} variant="muted" class={className}>{rating}</Chip>
{/if}
