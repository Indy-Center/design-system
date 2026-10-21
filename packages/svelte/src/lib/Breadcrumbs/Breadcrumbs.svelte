<script lang="ts" module>
  /** One crumb: a page above this one, or this page last. */
  export type Crumb = { href: string; label: string };
</script>

<script lang="ts">
  import { mdiChevronRight } from "@mdi/js";
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";
  import Link from "../Link/Link.svelte";

  type Props = HTMLAttributes<HTMLElement> & {
    /** The pages from the top down, ending with the page being shown. */
    items: Crumb[];
    /** Names the navigation for screen readers. "Breadcrumb" by default. */
    label?: string;
  };

  let {
    items,
    label = "Breadcrumb",
    class: className,
    ...rest
  }: Props = $props();

  // A crumb stands alone, so it is a 44px target, unlike a link in a sentence.
  const target = "inline-flex min-h-11 min-w-11 items-center justify-center";
</script>

<nav aria-label={label} {...rest} class={className}>
  <ol class="flex flex-wrap items-center text-sm">
    {#each items as crumb, i (crumb.href)}
      {@const current = i === items.length - 1}
      <li class="inline-flex items-center">
        {#if i > 0}
          <Icon
            path={mdiChevronRight}
            size={16}
            class="mx-1 text-muted-foreground"
          />
        {/if}
        {#if current}
          <a
            href={crumb.href}
            aria-current="page"
            class={[
              target,
              "rounded-sm text-foreground-soft",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            ]}>{crumb.label}</a
          >
        {:else}
          <Link href={crumb.href} class={target}>{crumb.label}</Link>
        {/if}
      </li>
    {/each}
  </ol>
</nav>
