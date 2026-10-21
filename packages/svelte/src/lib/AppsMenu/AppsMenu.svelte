<script lang="ts" module>
  /** One app in the menu of apps. */
  export type App = {
    /** The app's home page. */
    href: string;
    /** Its name: "Training". */
    label: string;
    /** A few words on what it holds. */
    description?: string;
    /** An MDI path, such as `mdiSchool` from `@mdi/js`. */
    icon?: string;
  };
</script>

<script lang="ts">
  import { mdiApps } from "@mdi/js";
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import HeaderMenu from "../headerMenu/HeaderMenu.svelte";
  import {
    currentClass,
    headerButton,
    menuRow,
  } from "../headerMenu/headerMenu.js";
  import { withoutTrailingSlash } from "../headerMenu/withoutTrailingSlash.js";

  type Props = HTMLAttributes<HTMLDivElement> & {
    /** The apps, in the order they show: `INDY_CENTER_APPS`, or an app's own list. */
    apps: readonly App[];
    /**
     * The `href` of the app this page is in, marked in the list. A
     * trailing slash on either doesn't count.
     */
    current?: string;
  };

  let { apps, current, class: className, ...rest }: Props = $props();
</script>

<!-- Dark in both schemes, as the header it sits in: data-theme after the
     caller's attributes so none can override it. -->
<div {...rest} data-theme="dark" class={className}>
  <HeaderMenu
    align="end"
    buttonClass={headerButton}
    panelClass="w-80 max-sm:fixed max-sm:inset-x-2 max-sm:top-16 max-sm:w-auto"
  >
    {#snippet trigger()}
      <Icon path={mdiApps} size={20} /><span class="max-sm:sr-only">Apps</span>
    {/snippet}
    <ul class="space-y-1">
      {#each apps as app}
        {@const isCurrent =
          current !== undefined &&
          withoutTrailingSlash(app.href) === withoutTrailingSlash(current)}
        <li>
          <a
            href={app.href}
            aria-current={isCurrent ? "true" : undefined}
            class={[menuRow, "py-2", isCurrent && currentClass]}
          >
            {#if app.icon}<Icon path={app.icon} size={20} />{/if}
            <span class="flex-1">
              <span class="block">{app.label}</span>
              {#if app.description}
                <!-- inline-block, so the name's underline doesn't reach it -->
                <span
                  class="inline-block text-xs font-normal text-muted-foreground"
                  >{app.description}</span
                >
              {/if}
            </span>
          </a>
        </li>
      {/each}
    </ul>
  </HeaderMenu>
</div>
