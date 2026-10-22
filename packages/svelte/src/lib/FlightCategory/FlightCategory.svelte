<script lang="ts" module>
  /** The flight categories, best weather first. */
  export const FLIGHT_CATEGORIES = ["VFR", "MVFR", "IFR", "LIFR"] as const;

  /** A flight category, as a METAR's ceiling and visibility give it. */
  export type FlightCategoryCode = (typeof FLIGHT_CATEGORIES)[number];
</script>

<script lang="ts">
  import { DEV } from "esm-env";
  import type { HTMLAttributes } from "svelte/elements";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children" | "title"> & {
    /** The category: `"VFR"`, `"MVFR"`, `"IFR"` or `"LIFR"`. */
    category: FlightCategoryCode;
  };

  let { category, class: className, ...rest }: Props = $props();

  // The FAA's colours on the roles; LIFR is IFR's red, filled. The tinted
  // text is the role a quarter of the way to `foreground`: in the role
  // alone, VFR in light and IFR in dark fall short of 4.5:1 on the tint.
  const looks: Record<FlightCategoryCode, { name: string; colour: string }> = {
    VFR: {
      name: "Visual flight rules",
      colour:
        "bg-success/15 text-[color-mix(in_oklab,var(--color-success)_75%,var(--color-foreground))]",
    },
    MVFR: {
      name: "Marginal visual flight rules",
      colour:
        "bg-info/15 text-[color-mix(in_oklab,var(--color-info)_75%,var(--color-foreground))]",
    },
    IFR: {
      name: "Instrument flight rules",
      colour:
        "bg-destructive/15 text-[color-mix(in_oklab,var(--color-destructive)_75%,var(--color-foreground))]",
    },
    LIFR: {
      name: "Low instrument flight rules",
      colour: "bg-destructive text-card",
    },
  };

  const look = $derived(looks[category]);

  $effect(() => {
    if (DEV && !look)
      console.warn(
        `FlightCategory: ${JSON.stringify(category)} is no flight category`,
      );
  });
</script>

{#if look}
  <abbr
    {...rest}
    title={look.name}
    class={[
      "rounded-sm px-1.5 py-0.5 text-xs font-semibold no-underline",
      look.colour,
      className,
    ]}>{category}</abbr
  >
{/if}
