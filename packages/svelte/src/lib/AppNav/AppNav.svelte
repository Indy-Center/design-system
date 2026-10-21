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

  /** `path` is `href`'s page, or a page under it ("/" only itself). */
  function isAtOrUnder(path: string, href: string) {
    if (href === path) return true;
    const base = href.replace(/\/$/, "");
    return base !== "" && path.startsWith(`${base}/`);
  }

  /**
   * The href of the link that marks `path` as current: the closest of
   * those it is, or is under.
   */
  function findCurrentHref(items: NavItem[], path: string | undefined) {
    if (path === undefined) return undefined;
    return items
      .flatMap((item) => (isGroup(item) ? item.children : [item]))
      .map((link) => link.href)
      .filter((href) => isAtOrUnder(path, href))
      .sort((a, b) => b.length - a.length)[0];
  }
</script>

<script lang="ts">
  import { mdiChevronDown } from "@mdi/js";
  import type { ClassValue, HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import HeaderMenu from "../headerMenu/HeaderMenu.svelte";
  import { barItem, currentClass, menuRow } from "../headerMenu/headerMenu.js";

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

  const currentHref = $derived(findCurrentHref(items, current));
  const holdsCurrent = (group: NavGroup) =>
    group.children.some((link) => link.href === currentHref);

  // The menu's groups the member opened or closed, by label, so a group
  // added later (an admin group after sign-in) doesn't take another's
  // state; the rest are open when they hold the current page.
  let toggled = $state<Record<string, boolean>>({});
  const uid = $props.id();

  // Icons are smaller in the bar's tighter row.
  const iconSize = $derived(layout === "bar" ? 16 : 20);
</script>

{#snippet link(item: NavLink, style: ClassValue)}
  {@const isCurrent = item.href === currentHref}
  <a
    href={item.href}
    aria-current={isCurrent ? "page" : undefined}
    class={[style, isCurrent && currentClass]}
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
              buttonClass={[barItem, holdsCurrent(item) && currentClass]}
              panelClass="w-56"
            >
              {#snippet trigger(open)}
                {#if item.icon}<Icon
                    path={item.icon}
                    size={iconSize}
                  />{/if}{item.label}{@render chevron(open)}
              {/snippet}
              <ul class="space-y-1">
                {#each item.children as child}
                  <li>{@render link(child, menuRow)}</li>
                {/each}
              </ul>
            </HeaderMenu>
          {:else}
            {@render link(item, barItem)}
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <ul class="space-y-1">
      {#each items as item, i}
        <li>
          {#if isGroup(item)}
            {@const open = toggled[item.label] ?? holdsCurrent(item)}
            {@const id = `app-nav-${uid}-${i}`}
            <button
              type="button"
              aria-expanded={open}
              aria-controls={id}
              class={[
                menuRow,
                "cursor-pointer",
                holdsCurrent(item) && currentClass,
              ]}
              onclick={() => (toggled[item.label] = !open)}
            >
              {#if item.icon}<Icon path={item.icon} size={iconSize} />{/if}
              <span class="flex-1 text-left">{item.label}</span>
              {@render chevron(open)}
            </button>
            <ul {id} hidden={!open} class="mt-1 space-y-1 pl-6">
              {#each item.children as child}
                <li>{@render link(child, menuRow)}</li>
              {/each}
            </ul>
          {:else}
            {@render link(item, menuRow)}
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</nav>
