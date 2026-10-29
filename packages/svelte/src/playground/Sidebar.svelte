<script lang="ts">
  // The site's navigation: every page, under its section's heading, with
  // the current one marked. Not AppNav or AppNavMenu: those are the dark
  // header's, for a handful of items, and this lists every component on
  // the page itself. At phone width it shows only while `open` (the
  // header's Contents button).
  import { Heading } from "../lib/index.ts";
  import type { SiteSection } from "./site.ts";

  type Props = {
    /** The sections, in order. */
    sections: SiteSection[];
    /** The page's path, marking the current page. */
    current: string;
    /** Below lg: whether it shows. */
    open?: boolean;
    /** Its id, for the button that shows it. */
    id?: string;
  };

  let { sections, current, open = false, id }: Props = $props();

  const here = $derived(current.replace(/(.)\/$/, "$1") || "/");

  const link = [
    "flex min-h-11 items-center rounded-md px-3 text-sm text-foreground-soft",
    "hover:bg-muted hover:text-foreground",
    "aria-[current=page]:bg-muted aria-[current=page]:font-semibold aria-[current=page]:text-foreground",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
  ];
</script>

<nav {id} aria-label="Site" class={["lg:block", !open && "max-lg:hidden"]}>
  {#each sections as section (section.heading)}
    <Heading level={2} look="label" class="mt-6 mb-1 px-3 first:mt-0">
      {section.heading}
    </Heading>
    <ul>
      {#each section.pages as page (page.href)}
        <li>
          <a
            href={page.href}
            aria-current={page.href === here ? "page" : undefined}
            class={link}>{page.label}</a
          >
        </li>
      {/each}
    </ul>
  {/each}
</nav>
