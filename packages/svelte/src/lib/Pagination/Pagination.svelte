<script lang="ts">
  import { mdiChevronLeft, mdiChevronRight } from "@mdi/js";
  import { tick } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";

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

  // Widths in rem: a page button is 44px, a "…" 24px, and previous and next
  // take two buttons. The wide row is never wider than 25rem, where it
  // takes over; the narrow one fits 294px, a card in the dark header on a
  // 390px phone.
  const button = 2.75;
  const gap = 1.5;
  const wideRoom = 25 - 2 * button;
  const narrowRoom = 18.375 - 2 * button;

  function width(pages: number[]) {
    const gaps = pages.filter((n, i) => i > 0 && n - pages[i - 1] > 1).length;
    return pages.length * button + gaps * gap;
  }

  // The pages a row shows: all of them if they fit in `room`; otherwise the
  // first, the last, and those within `reach` of the current one. A gap of
  // one page shows that page instead, while the row still fits.
  function pagesShown(reach: number, room: number): number[] {
    const all = Array.from({ length: pageCount }, (_, i) => i + 1);
    if (width(all) <= room) return all;
    let pages = all.filter(
      (n) => n === 1 || n === pageCount || Math.abs(n - page) <= reach,
    );
    for (let i = 1; i < pages.length; i++) {
      if (pages[i] - pages[i - 1] !== 2) continue;
      const filled = [...pages.slice(0, i), pages[i] - 1, ...pages.slice(i)];
      if (width(filled) <= room) pages = filled;
    }
    return pages;
  }

  // Which rows an item shows in. Both rows render, and a container query
  // hides the items the other row lacks.
  type Shows = "both" | "wide" | "narrow";
  type Item =
    { page: number; shows: Shows } | { gapBefore: number; shows: Shows };

  const showIn: Record<Shows, string | false> = {
    both: false,
    wide: "@max-[25rem]:hidden",
    narrow: "@min-[25rem]:hidden",
  };

  // The wide row keeps the current page's neighbours; the narrow one drops
  // them. Every narrow page is also a wide one, so walk the wide row.
  const items = $derived.by(() => {
    const wide = pagesShown(1, wideRoom);
    const narrow = new Set(pagesShown(0, narrowRoom));
    const out: Item[] = [];
    let lastWide = 0;
    let lastNarrow = 0;
    for (const n of wide) {
      const inNarrow = narrow.has(n);
      const gapInWide = n - lastWide > 1;
      const gapInNarrow = inNarrow && n - lastNarrow > 1;
      if (gapInWide || gapInNarrow) {
        const shows = !gapInNarrow ? "wide" : !gapInWide ? "narrow" : "both";
        out.push({ gapBefore: n, shows });
      }
      out.push({ page: n, shows: inNarrow ? "both" : "wide" });
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
    const clicked = event.currentTarget as HTMLButtonElement;
    await tick();
    if (clicked.disabled) {
      nav?.querySelector<HTMLElement>("[aria-current='page']")?.focus();
    }
  }

  const control = [
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  ];
</script>

<!-- Previous or next: dimmed, without the hover, at an end. -->
{#snippet step(name: string, to: number, atEnd: boolean, icon: string)}
  <button
    type="button"
    aria-label={name}
    disabled={atEnd}
    onclick={(e) => go(to, e)}
    class={[
      control,
      "text-foreground-soft enabled:hover:bg-muted enabled:hover:text-foreground",
      "disabled:cursor-not-allowed disabled:opacity-40",
    ]}
  >
    <Icon path={icon} size={20} />
  </button>
{/snippet}

{#if pageCount > 1}
  <nav
    bind:this={nav}
    aria-label={label}
    {...rest}
    class={["@container flex flex-wrap items-center", className]}
  >
    {@render step("Previous page", page - 1, page <= 1, mdiChevronLeft)}
    {#each items as item ("gapBefore" in item ? `gap-${item.gapBefore}` : item.page)}
      {#if "gapBefore" in item}
        <span
          data-gap
          aria-hidden="true"
          class={["w-6 text-center text-muted-foreground", showIn[item.shows]]}
          >…</span
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
              : "text-foreground-soft hover:bg-muted hover:text-foreground",
            showIn[item.shows],
          ]}>{n}</button
        >
      {/if}
    {/each}
    {@render step("Next page", page + 1, page >= pageCount, mdiChevronRight)}
  </nav>
{/if}
