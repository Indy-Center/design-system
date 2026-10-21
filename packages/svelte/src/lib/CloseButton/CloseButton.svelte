<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";

  // MDI's close.
  const closeIcon =
    "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z";

  // Name it with `aria-label` or `aria-labelledby`: "Dismiss" and what it
  // closes.
  type Props = HTMLButtonAttributes;

  let { class: className, ...rest }: Props = $props();
</script>

<!-- 44px square, pulled into the box's padding so the row stays one line
     tall. -->
<button
  type="button"
  {...rest}
  class={[
    "-my-2 -mr-3 inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    className,
  ]}
>
  <Icon path={closeIcon} />
</button>
