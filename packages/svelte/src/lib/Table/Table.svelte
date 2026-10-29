<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLTableAttributes } from "svelte/elements";

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
  class={[
    // Its width comes from its container, never the table, so a wide
    // table scrolls here instead of widening a page's grid or flex column.
    "overflow-x-auto [contain:inline-size] rounded-lg border border-border",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    className,
  ]}
>
  <!-- Selectors on the <table> style the caller's plain rows and cells. -->
  <table
    bind:this={table}
    {...rest}
    class={[
      "w-full border-collapse bg-card text-left text-sm",
      // A hidden caption (sr-only) keeps its zero padding.
      "[&_caption:not(.sr-only)]:px-4 [&_caption:not(.sr-only)]:py-3 [&_caption]:text-left [&_caption]:font-heading [&_caption]:text-base [&_caption]:font-semibold [&_caption]:text-foreground",
      "[&_thead]:bg-muted",
      "[&_th]:px-4 [&_th]:py-2 [&_th]:align-bottom [&_th]:font-semibold [&_th]:text-foreground",
      "[&_td]:px-4 [&_td]:py-3 [&_td]:align-top [&_td]:text-foreground-soft",
      "[&_tbody_th]:py-3 [&_tbody_th]:align-top [&_tbody_th]:font-medium",
      "[&_tr]:border-t [&_tr]:border-border [&_thead_tr:first-child]:border-t-0",
    ]}
  >
    <caption id="{id}-caption" class={{ "sr-only": hideCaption }}
      >{@render caption()}</caption
    >
    {@render children()}
  </table>
</div>
