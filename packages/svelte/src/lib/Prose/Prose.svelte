<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLElement> & {
    /** `article` for a document that stands alone; `div` for a part of one. */
    as?: "article" | "div";
    /** The rich text: usually `{@html body}` from the CMS. */
    children: Snippet;
  };

  let { as = "article", children, class: className, ...rest }: Props = $props();
</script>

<svelte:element
  this={as}
  {...rest}
  class={["prose prose-centerline", className]}
>
  {@render children()}
</svelte:element>
