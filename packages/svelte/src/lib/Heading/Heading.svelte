<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  const headingFont = "font-heading font-semibold text-foreground";
  const looks = {
    1: `text-3xl ${headingFont}`,
    2: `text-xl ${headingFont}`,
    3: `text-lg ${headingFont}`,
    4: `text-base ${headingFont}`,
    // The section label is in the body font, not the heading font.
    label:
      "font-sans text-xs font-semibold tracking-wider text-muted-foreground uppercase",
  };

  type Look = keyof typeof looks;
  type SizedLook = Exclude<Look, "label">;

  type Props = HTMLAttributes<HTMLHeadingElement> & {
    /** The heading's place in the page's outline: `h1` to `h6`. */
    level: 1 | 2 | 3 | 4 | 5 | 6;
    /** How big it looks, apart from its level. The level's own look by default. */
    look?: Look;
    /** The heading's text. */
    children: Snippet;
  };

  let { level, look, children, class: className, ...rest }: Props = $props();

  // h5 and h6 look like h4: below it, sizes stop being told apart.
  let appliedLook = $derived(look ?? (Math.min(level, 4) as SizedLook));
</script>

<svelte:element
  this={`h${level}`}
  {...rest}
  class={[looks[appliedLook], className]}>{@render children()}</svelte:element
>
