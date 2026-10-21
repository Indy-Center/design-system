<script lang="ts">
  import { mdiChevronDown } from "@mdi/js";
  import Icon from "../Icon/Icon.svelte";
  import HeaderMenu from "../headerMenu/HeaderMenu.svelte";
  import { barItem, currentClass, menuRow } from "../headerMenu/headerMenu.js";
  import AppNavLink from "./AppNavLink.svelte";
  import {
    findCurrentHref,
    holdsCurrent,
    isGroup,
    type NavProps,
  } from "./nav.js";

  type Props = NavProps;

  let {
    items,
    current,
    label = "Main",
    class: className,
    ...rest
  }: Props = $props();

  const currentHref = $derived(findCurrentHref(items, current));

  // Icons are smaller in the bar's tighter row.
  const iconSize = 16;
</script>

<!-- The header bar: groups open a panel under their button. Dark in both
     schemes, as the header it sits in: aria-label and data-theme after the
     caller's attributes so none can override them. -->
<nav {...rest} aria-label={label} data-theme="dark" class={className}>
  <ul class="flex items-center gap-1">
    <!-- Unkeyed: two items may share a label. -->
    {#each items as item}
      <li>
        {#if isGroup(item)}
          <HeaderMenu
            buttonClass={[
              barItem,
              holdsCurrent(item, currentHref) && currentClass,
            ]}
            panelClass="w-56"
          >
            {#snippet trigger(open)}
              {#if item.icon}<Icon
                  path={item.icon}
                  size={iconSize}
                />{/if}{item.label}<Icon
                path={mdiChevronDown}
                size={16}
                class={[
                  "motion-safe:transition-transform",
                  open && "rotate-180",
                ]}
              />
            {/snippet}
            <ul class="space-y-1">
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
          </HeaderMenu>
        {:else}
          <AppNavLink link={item} {currentHref} {iconSize} class={barItem} />
        {/if}
      </li>
    {/each}
  </ul>
</nav>
