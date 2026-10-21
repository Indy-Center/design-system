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
          /** Not with `lead`: a lead line is never muted. */
          tone?: never;
          /** Not with `lead`: a lead line is never small. */
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

  const looks = {
    lead: "text-lg text-foreground-soft",
    small: "text-sm text-muted-foreground",
    muted: "text-base text-muted-foreground",
  };

  // One look at a time: small is muted already, so it wins over muted.
  let look: keyof typeof looks | undefined = $derived(
    lead ? "lead" : (size ?? tone),
  );
</script>

<svelte:element this={as} {...rest} class={[look && looks[look], className]}
  >{@render children()}</svelte:element
>
