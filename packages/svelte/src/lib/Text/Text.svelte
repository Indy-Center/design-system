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
          /** Not a lead line. */
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

  // One look at a time: small is muted already, so it wins over muted.
  let look = $derived(
    lead
      ? "text-lg text-foreground-soft"
      : size === "small"
        ? "text-sm text-muted-foreground"
        : tone === "muted"
          ? "text-base text-muted-foreground"
          : undefined,
  );
</script>

<svelte:element this={as} {...rest} class={[look, className]}
  >{@render children()}</svelte:element
>
