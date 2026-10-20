<script lang="ts" module>
  /** One tab: a link to a section's page. */
  export type Tab = {
    href: string;
    label: string;
    /** Whether this is the page being shown. */
    current?: boolean;
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";

  type Props = HTMLAttributes<HTMLElement> & {
    /** What the tabs move between, for screen readers: "Admin", "Course". */
    label: string;
    /** The tabs, in order. Mark the page being shown with `current`. */
    items: Tab[];
  };

  let { label, items, class: className, ...rest }: Props = $props();
</script>

<nav aria-label={label} {...rest} class={className}>
  <!-- Scrolls sideways when the tabs are wider than a phone. -->
  <ul class="flex overflow-x-auto border-b border-border">
    {#each items as tab (tab.href)}
      <li class="shrink-0">
        <a
          href={tab.href}
          aria-current={tab.current ? "page" : undefined}
          class={[
            "inline-flex min-h-11 min-w-11 items-center justify-center border-b-2 px-3 text-sm whitespace-nowrap",
            tab.current
              ? "border-link font-semibold text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
            // Inset, so the scrolling list doesn't clip it.
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          ]}>{tab.label}</a
        >
      </li>
    {/each}
  </ul>
</nav>
