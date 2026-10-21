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

  let region: HTMLDivElement;
  let table: HTMLTableElement;
  // Focusable until mounted, so a table that scrolls stays reachable
  // without script; after that, only while the table is wider than the region.
  let scrolls = $state(true);

  $effect(() => {
    const observer = new ResizeObserver(() => {
      scrolls = region.scrollWidth > region.clientWidth;
    });
    observer.observe(region);
    observer.observe(table);
    return () => observer.disconnect();
  });
</script>

<!-- The region takes focus when the table scrolls: a keyboard can only
     scroll what it can focus (WCAG 2.1.1). -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  bind:this={region}
  role="region"
  aria-labelledby="{id}-caption"
  tabindex={scrolls ? 0 : undefined}
  class={[tableRegionClasses, className]}
>
  <table bind:this={table} {...rest} class={tableClasses}>
    <caption id="{id}-caption" class={{ "sr-only": hideCaption }}
      >{@render caption()}</caption
    >
    {@render children()}
  </table>
</div>
