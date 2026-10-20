<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLTableAttributes } from "svelte/elements";
  import { tableClasses, tableRegionClasses } from "./tableClasses.js";

  type Props = HTMLTableAttributes & {
    /** What the table holds; names the table and its scroll region. */
    caption: Snippet;
    /** Show the caption to screen readers only, when a heading above already says it. */
    hideCaption?: boolean;
    /** The rows: `<thead>` and `<tbody>`, with `Th` for header cells. */
    children: Snippet;
  };

  let {
    caption,
    hideCaption = false,
    children,
    class: className,
    ...rest
  }: Props = $props();

  const id = $props.id();
</script>

<!-- The region takes focus on purpose: a keyboard can only scroll what it
     can focus (WCAG 2.1.1). -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  role="region"
  aria-labelledby="{id}-caption"
  tabindex="0"
  class={[tableRegionClasses, className]}
>
  <table {...rest} class={tableClasses}>
    <caption id="{id}-caption" class={{ "sr-only": hideCaption }}
      >{@render caption()}</caption
    >
    {@render children()}
  </table>
</div>
