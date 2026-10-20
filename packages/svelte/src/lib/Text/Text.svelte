<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLElement> & {
    /** The element: a paragraph by default, `span` inside a line, `div` around blocks. */
    as?: "p" | "span" | "div";
    /** The text. */
    children: Snippet;
  } & (
      | {
          /** The opening line under a page title: larger, in the body colour. */
          lead: true;
          tone?: never;
          size?: never;
        }
      | {
          lead?: false;
          /** `muted` for captions and fine print. */
          tone?: "muted";
          /** `small` for hints and sub-lines; muted too. */
          size?: "small";
        }
    );

  let {
    as = "p",
    lead = false,
    tone,
    size,
    children,
    class: className,
    ...rest
  }: Props = $props();
</script>

<svelte:element
  this={as}
  {...rest}
  class={[
    lead && "text-lg text-foreground-soft",
    tone === "muted" && "text-muted-foreground",
    size === "small" && "text-sm text-muted-foreground",
    className,
  ]}>{@render children()}</svelte:element
>
