<script lang="ts">
  import { tick } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";

  // MDI's chevron-left and chevron-right.
  const left = "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z";
  const right = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z";

  type Props = Omit<HTMLAttributes<HTMLElement>, "onchange"> & {
    /** How many pages there are. Nothing renders for one or none. */
    pageCount: number;
    /** The page shown, from 1. Bindable. */
    page?: number;
    /** Called with the new page when the member moves to one. */
    onchange?: (page: number) => void;
    /** Names the navigation for screen readers. "Pagination" by default. */
    label?: string;
  };

  let {
    pageCount,
    page = $bindable(1),
    onchange,
    label = "Pagination",
    class: className,
    ...rest
  }: Props = $props();

  let nav = $state<HTMLElement>();

  type Item =
    | { page: number; narrow: boolean }
    | { gap: number; wide: boolean; narrow: boolean };

  // Which pages to show: all of them when there are no more than `room`;
  // otherwise the first, the last, and those within `reach` of the current
  // one. A gap of one page shows that page instead.
  function pagesToShow(reach: number, room: number) {
    if (pageCount <= room) return () => true;
    const keep = (n: number) =>
      n === 1 || n === pageCount || Math.abs(n - page) <= reach;
    return (n: number) => keep(n) || (keep(n - 1) && keep(n + 1));
  }

  // The wide row keeps the current page's neighbours; the narrow one, under
  // 23rem, drops them. Every narrow page is also a wide one, so one list
  // serves both, each item marked with the widths it shows at.
  const items = $derived.by(() => {
    // Room, at 44px a button: six pages in 23rem, four in a phone's card.
    const wide = pagesToShow(1, 6);
    const narrow = pagesToShow(0, 4);
    const out: Item[] = [];
    let lastWide = 0;
    let lastNarrow = 0;
    for (let n = 1; n <= pageCount; n++) {
      if (!wide(n)) continue;
      const inNarrow = narrow(n);
      const gapWide = n - lastWide > 1;
      const gapNarrow = inNarrow && n - lastNarrow > 1;
      if (gapWide || gapNarrow) {
        out.push({ gap: n, wide: gapWide, narrow: gapNarrow });
      }
      out.push({ page: n, narrow: inNarrow });
      lastWide = n;
      if (inNarrow) lastNarrow = n;
    }
    return out;
  });

  async function go(to: number, event: MouseEvent) {
    page = to;
    onchange?.(to);
    // Previous or next turns disabled at an end, which drops focus; put it
    // on the page reached instead.
    const button = event.currentTarget as HTMLButtonElement;
    await tick();
    if (button.disabled) {
      nav?.querySelector<HTMLElement>("[aria-current='page']")?.focus();
    }
  }

  const control = [
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  ];
  // A page that isn't the current one.
  const pageButton =
    "text-foreground-soft hover:bg-muted hover:text-foreground";
  // Previous and next: dimmed, without the hover, at an end.
  const stepButton = [
    control,
    "text-foreground-soft enabled:hover:bg-muted enabled:hover:text-foreground",
    "disabled:cursor-not-allowed disabled:opacity-40",
  ];
</script>

{#if pageCount > 1}
  <nav
    bind:this={nav}
    aria-label={label}
    {...rest}
    class={["@container flex flex-wrap items-center", className]}
  >
    <button
      type="button"
      aria-label="Previous page"
      disabled={page <= 1}
      onclick={(e) => go(page - 1, e)}
      class={stepButton}
    >
      <Icon path={left} size={20} />
    </button>
    {#each items as item ("gap" in item ? `gap-${item.gap}` : item.page)}
      {#if "gap" in item}
        <span
          data-gap
          aria-hidden="true"
          class={[
            "w-6 text-center text-muted-foreground",
            !item.narrow && "@max-[23rem]:hidden",
            !item.wide && "@min-[23rem]:hidden",
          ]}>…</span
        >
      {:else}
        {@const n = item.page}
        <button
          type="button"
          aria-label="Page {n}"
          aria-current={n === page ? "page" : undefined}
          onclick={(e) => go(n, e)}
          class={[
            control,
            n === page
              ? "bg-primary font-semibold text-primary-foreground"
              : pageButton,
            !item.narrow && "@max-[23rem]:hidden",
          ]}>{n}</button
        >
      {/if}
    {/each}
    <button
      type="button"
      aria-label="Next page"
      disabled={page >= pageCount}
      onclick={(e) => go(page + 1, e)}
      class={stepButton}
    >
      <Icon path={right} size={20} />
    </button>
  </nav>
{/if}
