<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLElement> & {
    /** The element: a `div` by default; `article` for one item of a feed, `li` in a list of cards, `section` for a part of the page. */
    as?: "div" | "article" | "section" | "li";
    /** No padding, for content that runs to the edges: a divided list, a table. */
    flush?: boolean;
    /** What the card holds. */
    children: Snippet;
  };

  let {
    as = "div",
    flush = false,
    children,
    class: className,
    ...rest
  }: Props = $props();
</script>

<svelte:element
  this={as}
  {...rest}
  class={[
    "rounded-lg border border-border bg-card",
    // A flush card clips its content to the rounded corners.
    flush ? "overflow-hidden" : "p-4",
    className,
  ]}>{@render children()}</svelte:element
>
