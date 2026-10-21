<script lang="ts" module>
  /** A page in the app's navigation. */
  export type NavLink = {
    /** Its name. */
    label: string;
    /** Where it goes. */
    href: string;
    /** An MDI path, such as `mdiCalendar` from `@mdi/js`. */
    icon?: string;
  };
  /** A group of pages, shown from a button. Never a group in a group. */
  export type NavGroup = {
    /** Its name, on the button. */
    label: string;
    /** Its pages, in order. */
    children: NavLink[];
    /** An MDI path, such as `mdiHeadset` from `@mdi/js`. */
    icon?: string;
  };
  /** A top-level item: a page, or a group of pages. */
  export type NavItem = NavLink | NavGroup;

  const isGroup = (item: NavItem): item is NavGroup => "children" in item;

  /** `href` is `path`, or `path` is a page under it ("/" only itself). */
  function holds(href: string, path: string) {
    if (href === path) return true;
    const base = href.replace(/\/$/, "");
    return base !== "" && path.startsWith(`${base}/`);
  }

  /**
   * The href of the link that marks `path` as current: the closest of
   * those it is, or is under.
   */
  function currentHref(items: NavItem[], path: string | undefined) {
    if (path === undefined) return undefined;
    return items
      .flatMap((item) => (isGroup(item) ? item.children : [item]))
      .map((link) => link.href)
      .filter((href) => holds(href, path))
      .sort((a, b) => b.length - a.length)[0];
  }
</script>

<script lang="ts">
  import { mdiChevronDown } from "@mdi/js";
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import HeaderMenu from "../headerMenu/HeaderMenu.svelte";
  import {
    barItem,
    current as currentClass,
    menuRow,
  } from "../headerMenu/headerMenu.js";

  type Props = HTMLAttributes<HTMLElement> & {
    /** The app's pages and groups, in order. */
    items: NavItem[];
    /**
     * The page's path, such as `page.url.pathname`. The link it is, or is
     * under, is marked as the current page.
     */
    current?: string;
    /**
     * `bar` for the header on wide screens, groups opening a panel under
     * them; `menu` for the phone menu, groups opening in place. `bar` by
     * default.
     */
    layout?: "bar" | "menu";
    /** Names the navigation for screen readers. "Main" by default. */
    label?: string;
  };

  let {
    items,
    current,
    layout = "bar",
    label = "Main",
    class: className,
    ...rest
  }: Props = $props();

  const here = $derived(currentHref(items, current));
  const holdsHere = (group: NavGroup) =>
    group.children.some((link) => link.href === here);

  // The menu's groups the member opened or closed, by position; the rest
  // are open when they hold the current page.
  let toggled = $state<Record<number, boolean>>({});
  const uid = $props.id();
</script>

{#snippet link(item: NavLink, style: typeof barItem, iconSize: number)}
  {@const isHere = item.href === here}
  <a
    href={item.href}
    aria-current={isHere ? "page" : undefined}
    class={[style, isHere && currentClass]}
  >
    {#if item.icon}<Icon path={item.icon} size={iconSize} />{/if}{item.label}
  </a>
{/snippet}

{#snippet chevron(open: boolean)}
  <Icon
    path={mdiChevronDown}
    size={16}
    class={["motion-safe:transition-transform", open && "rotate-180"]}
  />
{/snippet}

<!-- Dark in both schemes, as the header it sits in: data-theme after the
     caller's attributes so none can override it. -->
<nav aria-label={label} {...rest} data-theme="dark" class={className}>
  {#if layout === "bar"}
    <ul class="flex items-center gap-1">
      <!-- Unkeyed: two items may share a label. -->
      {#each items as item}
        <li>
          {#if isGroup(item)}
            <HeaderMenu
              buttonClass={[barItem, holdsHere(item) && currentClass]}
              panelClass="w-56"
            >
              {#snippet trigger(open)}
                {#if item.icon}<Icon
                    path={item.icon}
                    size={16}
                  />{/if}{item.label}{@render chevron(open)}
              {/snippet}
              <ul class="space-y-1">
                {#each item.children as child}
                  <li>{@render link(child, menuRow, 16)}</li>
                {/each}
              </ul>
            </HeaderMenu>
          {:else}
            {@render link(item, barItem, 16)}
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <ul class="space-y-1">
      {#each items as item, i}
        <li>
          {#if isGroup(item)}
            {@const open = toggled[i] ?? holdsHere(item)}
            {@const id = `app-nav-${uid}-${i}`}
            <button
              type="button"
              aria-expanded={open}
              aria-controls={id}
              class={[
                menuRow,
                "cursor-pointer",
                holdsHere(item) && currentClass,
              ]}
              onclick={() => (toggled[i] = !open)}
            >
              {#if item.icon}<Icon path={item.icon} size={20} />{/if}
              <span class="flex-1 text-left">{item.label}</span>
              {@render chevron(open)}
            </button>
            <ul {id} hidden={!open} class="mt-1 space-y-1 pl-6">
              {#each item.children as child}
                <li>{@render link(child, menuRow, 20)}</li>
              {/each}
            </ul>
          {:else}
            {@render link(item, menuRow, 20)}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</nav>
