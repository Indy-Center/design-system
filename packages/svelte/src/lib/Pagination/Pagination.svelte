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

  // The first and last pages and those beside the current one, with null
  // for a gap. A gap of one page shows that page instead.
  const shown = $derived.by(() => {
    const keep = (n: number) =>
      n === 1 || n === pageCount || Math.abs(n - page) <= 1;
    const out: (number | null)[] = [];
    for (let n = 1; n <= pageCount; n++) {
      if (keep(n) || (keep(n - 1) && keep(n + 1))) out.push(n);
      else if (out.at(-1) !== null) out.push(null);
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
  const other = "text-foreground-soft hover:bg-muted hover:text-foreground";
  // Previous and next: dimmed, without the hover, at an end.
  const end = [
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
    class={["flex flex-wrap items-center", className]}
  >
    <button
      type="button"
      aria-label="Previous page"
      disabled={page <= 1}
      onclick={(e) => go(page - 1, e)}
      class={end}
    >
      <Icon path={left} size={20} />
    </button>
    {#each shown as n, i (n ?? `gap-${i}`)}
      {#if n === null}
        <span
          data-gap
          aria-hidden="true"
          class="w-6 text-center text-muted-foreground">…</span
        >
      {:else}
        <button
          type="button"
          aria-label="Page {n}"
          aria-current={n === page ? "page" : undefined}
          onclick={(e) => go(n, e)}
          class={[
            control,
            n === page
              ? "bg-primary font-semibold text-primary-foreground"
              : other,
          ]}>{n}</button
        >
      {/if}
    {/each}
    <button
      type="button"
      aria-label="Next page"
      disabled={page >= pageCount}
      onclick={(e) => go(page + 1, e)}
      class={end}
    >
      <Icon path={right} size={20} />
    </button>
  </nav>
{/if}
