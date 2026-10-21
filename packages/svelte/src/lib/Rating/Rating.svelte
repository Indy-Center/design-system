<script lang="ts">
  import { DEV } from "esm-env";
  import type { HTMLAttributes } from "svelte/elements";
  import { findPilotRating, findRating } from "../aviation/ratings.js";
  import Chip from "../Chip/Chip.svelte";

  type Props = HTMLAttributes<HTMLSpanElement> & {
    /** The rating as the data source spells it: `5`, `"C1"` or `"Controller1"`; for a pilot, `3` or `"IR"`. */
    rating: number | string;
    /** Whose rating it is: a controller's (the default) or a pilot's. */
    kind?: "controller" | "pilot";
  };

  let {
    rating,
    kind = "controller",
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

<!-- The focus lands on the abbr inside, but the ring goes round the chip. -->
<Chip
  {...rest}
  variant="muted"
  class={[
    "relative has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring",
    className,
  ]}
>
  {#if found}
    <!-- Focusable, so a keyboard user can read the long name too: it shows
         beneath the chip on focus, and a mouse gets the title. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <abbr
      title={found.long}
      tabindex="0"
      class="group no-underline outline-none"
      >{found.short}<span
        class="sr-only group-focus-visible:not-sr-only group-focus-visible:absolute group-focus-visible:top-full group-focus-visible:left-0 group-focus-visible:z-10 group-focus-visible:mt-2 group-focus-visible:rounded-md group-focus-visible:bg-foreground group-focus-visible:px-2 group-focus-visible:py-1 group-focus-visible:font-sans group-focus-visible:font-normal group-focus-visible:whitespace-nowrap group-focus-visible:text-background"
      >
        {" "}{found.long}</span
      ></abbr
    >
  {:else}
    {rating}
  {/if}
</Chip>
