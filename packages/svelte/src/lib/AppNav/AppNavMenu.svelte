<script lang="ts">
  import { mdiChevronDown } from "@mdi/js";
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import { currentClass, menuRow } from "../headerMenu/headerMenu.js";
  import AppNavLink from "./AppNavLink.svelte";
  import {
    findCurrentHref,
    holdsCurrent,
    isGroup,
    type NavItem,
  } from "./nav.js";

  type Props = HTMLAttributes<HTMLElement> & {
    /** The app's pages and groups, in order. */
    items: NavItem[];
    /**
     * The page's path, such as `page.url.pathname`. The link it is, or is
     * under, is marked as the current page.
     */
    current?: string;
    /** Names the navigation for screen readers. "Main" by default. */
    label?: string;
  };

  let {
    items,
    current,
    label = "Main",
    class: className,
    ...rest
  }: Props = $props();

  const currentHref = $derived(findCurrentHref(items, current));

  // The groups the member opened or closed, by position in `items`, so two
  // groups with one label open separately; the rest are open when they
  // hold the current page.
  let toggled = $state<Record<number, boolean>>({});
  const uid = $props.id();

  const iconSize = 20;
</script>

<!-- The phone menu: one row each, groups opening in place. Dark in both
     schemes, as the header it sits in: data-theme after the caller's
     attributes so none can override it. -->
<nav aria-label={label} {...rest} data-theme="dark" class={className}>
  <ul class="space-y-1">
    {#each items as item, i}
      <li>
        {#if isGroup(item)}
          {@const holdsCurrentPage = holdsCurrent(item, currentHref)}
          {@const open = toggled[i] ?? holdsCurrentPage}
          {@const id = `app-nav-menu-${uid}-${i}`}
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            class={[
              menuRow,
              "cursor-pointer",
              holdsCurrentPage && currentClass,
            ]}
            onclick={() => (toggled[i] = !open)}
          >
            {#if item.icon}<Icon path={item.icon} size={iconSize} />{/if}
            <span class="flex-1 text-left">{item.label}</span>
            <Icon
              path={mdiChevronDown}
              size={16}
              class={["motion-safe:transition-transform", open && "rotate-180"]}
            />
          </button>
          <ul {id} hidden={!open} class="mt-1 space-y-1 pl-6">
            {#each item.children as child}
              <li>
                <AppNavLink
                  link={child}
                  {currentHref}
                  {iconSize}
                  class={menuRow}
                />
              </li>
            {/each}
          </ul>
        {:else}
          <AppNavLink link={item} {currentHref} {iconSize} class={menuRow} />
        {/if}
      </li>
    {/each}
  </ul>
</nav>
