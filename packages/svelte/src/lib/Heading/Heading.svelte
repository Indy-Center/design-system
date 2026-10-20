<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLHeadingElement> & {
    /** The heading's place in the page's outline: `h1` to `h6`. */
    level: 1 | 2 | 3 | 4 | 5 | 6;
    /** How big it looks, apart from its level. The level's own look by default. */
    look?: 1 | 2 | 3 | 4 | "label";
    /** The heading's text. */
    children: Snippet;
  };

  let { level, look, children, class: className, ...rest }: Props = $props();

  // h5 and h6 look like h4: below it, sizes stop being told apart.
  const sizes = {
    1: "text-3xl",
    2: "text-xl",
    3: "text-lg",
    4: "text-base",
  };

  let shown = $derived(look ?? (Math.min(level, 4) as 1 | 2 | 3 | 4));
</script>

<svelte:element
  this={`h${level}`}
  {...rest}
  class={[
    shown === "label"
      ? "font-sans text-xs font-semibold tracking-wider text-muted-foreground uppercase"
      : [sizes[shown], "font-heading font-semibold text-foreground"],
    className,
  ]}>{@render children()}</svelte:element
>
