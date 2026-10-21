<!-- Read-only stars: a rating out of 5, to the nearest half star, read as
     words ("4.5 out of 5"). -->
<script lang="ts">
  import { mdiStar, mdiStarHalfFull, mdiStarOutline } from "@mdi/js";
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import { STARS, starsInWords } from "./stars.js";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** The rating, 0 to 5; an average is fine, it's drawn to the nearest half. */
    value: number;
  };

  let { value, class: className, ...rest }: Props = $props();

  const rounded = $derived(
    Math.min(STARS.length, Math.max(0, Math.round(value * 2) / 2)),
  );

  function pathOf(star: number) {
    if (star <= rounded) return mdiStar;
    if (star - 0.5 === rounded) return mdiStarHalfFull;
    return mdiStarOutline;
  }
</script>

<span
  role="img"
  aria-label={starsInWords(rounded)}
  {...rest}
  class={["inline-flex", className]}
>
  {#each STARS as star (star)}
    <Icon
      path={pathOf(star)}
      class={star - 0.5 <= rounded ? "text-warning" : "text-muted-foreground"}
    />
  {/each}
</span>
