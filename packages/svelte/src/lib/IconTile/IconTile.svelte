<script lang="ts">
  import type { Snippet } from "svelte";
  import type { ClassValue } from "svelte/elements";

  // A decorative icon on a tinted tile: ErrorPage's and EmptyState's
  // circles and StatCard's square, so their colours can't drift apart.
  type Props = {
    /** `primary` at 15% with the icon in `link` (ErrorPage, StatCard), or `muted` with it in `muted-foreground` (EmptyState). */
    tone: "primary" | "muted";
    /** `circle`, or `square` with rounded corners (StatCard's). */
    shape: "circle" | "square";
    /** The caller's size and spacing, such as `mb-4 size-16 text-3xl`. */
    class?: ClassValue;
    /** The icon. Hidden from screen readers with the tile. */
    children: Snippet;
  };

  let { tone, shape, class: className, children }: Props = $props();

  const tones = {
    primary: "bg-primary/15 text-link",
    muted: "bg-muted text-muted-foreground",
  };
  const shapes = { circle: "rounded-full", square: "rounded-lg" };
</script>

<div
  aria-hidden="true"
  class={[
    "flex shrink-0 items-center justify-center",
    tones[tone],
    shapes[shape],
    className,
  ]}
>
  {@render children()}
</div>
