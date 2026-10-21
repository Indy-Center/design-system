<script lang="ts" module>
  /** One link in the footer's map. */
  export type FooterLink = { href: string; label: string };
  /** One column of the footer's map: a heading over its links. */
  export type FooterColumn = { heading: string; links: FooterLink[] };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import Logo from "../Logo/Logo.svelte";

  type Props = HTMLAttributes<HTMLElement> & {
    /** The map of links, a column each, in the order they show. */
    columns: FooterColumn[];
    /** Names the map's navigation for screen readers. "Footer" by default. */
    label?: string;
  };

  let {
    columns,
    label = "Footer",
    class: className,
    ...rest
  }: Props = $props();

  const year = new Date().getFullYear();
</script>

<!-- Dark in both schemes: the roles inside follow data-theme="dark". -->
<footer
  data-theme="dark"
  {...rest}
  class={["border-t border-border bg-background", className]}
>
  <div class="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:grid-cols-3">
    <!-- Source order is the visual order: the map, then the disclaimer. -->
    <nav
      aria-label={label}
      class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:col-span-2"
    >
      {#each columns as column (column.heading)}
        <div>
          <h2
            class="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
          >
            {column.heading}
          </h2>
          <ul>
            {#each column.links as link (link.href)}
              <li>
                <a
                  href={link.href}
                  class={[
                    "inline-flex min-h-11 items-center rounded-sm text-sm text-foreground-soft underline-offset-4",
                    "hover:text-foreground hover:underline",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  ]}>{link.label}</a
                >
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </nav>

    <div class="self-start">
      <Logo class="mb-3 h-8 w-auto text-foreground" />
      <div class="rounded-lg border border-border p-4">
        <p class="text-xs leading-relaxed text-muted-foreground">
          This site is not affiliated with the Federal Aviation Administration
          or any governing aviation body. All content contained herein is
          approved only for use on the VATSIM network.
        </p>
        <p class="mt-2 text-xs text-muted-foreground">
          Copyright {year} Indy Center
        </p>
      </div>
    </div>
  </div>
</footer>
