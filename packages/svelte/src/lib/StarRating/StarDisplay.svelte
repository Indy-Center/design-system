<!-- Read-only stars: a rating out of 5, to the nearest half star, read as
     words ("4.5 out of 5"). -->
<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import { STARS, starLook, starsInWords } from "./stars.js";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** The rating, 0 to 5; an average is fine, it's drawn to the nearest half. */
    value: number;
  };

  let { value, class: className, ...rest }: Props = $props();

  const rounded = $derived(
    Math.min(STARS.length, Math.max(0, Math.round(value * 2) / 2)),
  );
</script>

<!-- A caller's aria-label (an exact average) wins over the rounded words. -->
<span
  role="img"
  aria-label={starsInWords(rounded)}
  {...rest}
  class={["inline-flex", className]}
>
  {#each STARS as star (star)}
    {@const look = starLook(star, rounded)}
    <Icon path={look.path} class={look.colour} />
  {/each}
</span>
