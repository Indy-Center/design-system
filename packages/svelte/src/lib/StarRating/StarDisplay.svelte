<!-- Read-only stars: a rating out of 5, drawn to the nearest half star and
     read to one decimal ("4.3 out of 5"). -->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import {
    STARS,
    clampStars,
    starLook,
    starsInWords,
    toHalfStar,
  } from "./stars.js";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** The rating, 0 to 5; an average is fine. Not a number (an average of nothing) reads "Not rated". */
    value: number;
  };

  let { value, class: className, ...rest }: Props = $props();

  const rated = $derived(Number.isFinite(value));
  const drawn = $derived(rated ? toHalfStar(value) : 0);
  const words = $derived(
    rated ? starsInWords(Math.round(clampStars(value) * 10) / 10) : "Not rated",
  );
</script>

<!-- A caller's aria-label wins over the words. -->
<span
  role="img"
  aria-label={words}
  {...rest}
  class={["inline-flex", className]}
>
  {#each STARS as star (star)}
    {@const look = starLook(star, drawn)}
    <Icon path={look.path} class={look.colour} />
  {/each}
</span>
