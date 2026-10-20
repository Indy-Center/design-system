<script lang="ts" module>
  /** One crumb: a page above this one, or this page last. */
  export type Crumb = { href: string; label: string };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Icon from "../Icon/Icon.svelte";

  // MDI's chevron-right.
  const chevron = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z";

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
</script>

<nav aria-label={label} {...rest} class={className}>
  <ol class="flex flex-wrap items-center text-sm">
    {#each items as crumb, i (crumb.href)}
      {@const current = i === items.length - 1}
      <li class="inline-flex items-center">
        {#if i > 0}
          <Icon path={chevron} size={16} class="mx-1 text-muted-foreground" />
        {/if}
        <a
          href={crumb.href}
          aria-current={current ? "page" : undefined}
          class={[
            "inline-flex min-h-11 items-center rounded-sm",
            current
              ? "text-foreground-soft"
              : "text-link underline underline-offset-4 hover:decoration-2",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          ]}>{crumb.label}</a
        >
      </li>
    {/each}
  </ol>
</nav>
