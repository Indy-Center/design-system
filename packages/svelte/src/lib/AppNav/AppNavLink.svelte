<!-- One link in AppNav or AppNavMenu, marked when it is the current page.
     Not exported. -->
<script lang="ts">
  import type { ClassValue } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import { currentClass } from "../headerMenu/headerMenu.js";
  import type { NavLink } from "./nav.js";

  type Props = {
    /** The page it goes to. */
    link: NavLink;
    /** The current page's link's href, from `findCurrentHref`. */
    currentHref?: string;
    /** Its icon's size: 16 in the bar, 20 in a menu. */
    iconSize: number;
    /** Its classes: `barItem` or `menuRow`. */
    class: ClassValue;
  };

  let { link, currentHref, iconSize, class: className }: Props = $props();

  const isCurrent = $derived(link.href === currentHref);
</script>

<a
  href={link.href}
  aria-current={isCurrent ? "page" : undefined}
  class={[className, isCurrent && currentClass]}
>
  {#if link.icon}<Icon path={link.icon} size={iconSize} />{/if}{link.label}
</a>
