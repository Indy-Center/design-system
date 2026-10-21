<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { AirportInfo } from "../aviation/airport.js";
  import Tooltip from "../Tooltip/Tooltip.svelte";

  type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    /** The airport: `{ code: "KIND", name: "Indianapolis International" }`. */
    airport: AirportInfo;
    /** Where the name goes: `"inline"` after the code (the default), or in a `"tooltip"`, for an expert audience. */
    nameAt?: "inline" | "tooltip";
    /** With the name in a tooltip, whether the code is a tab stop, for places with few airports. */
    focusable?: boolean;
  };

  let {
    airport,
    nameAt = "inline",
    focusable = false,
    class: className,
    ...rest
  }: Props = $props();
</script>

{#if nameAt === "tooltip" && airport.name}
  <!-- As Rating: the hidden text reads the name, so the tooltip is hidden
       from screen readers and the trigger's aria-describedby left off. -->
  <Tooltip text={airport.name} aria-hidden="true" class={className}>
    {#snippet children()}
      <!-- When focusable, a keyboard can show the tooltip too. No title:
           some screen readers would say the name twice. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <abbr
        {...rest}
        tabindex={focusable ? 0 : undefined}
        class={[
          "font-mono no-underline",
          focusable &&
            "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        ]}>{airport.code}<span class="sr-only">{" "}{airport.name}</span></abbr
      >
    {/snippet}
  </Tooltip>
{:else}
  <span {...rest} class={className}
    ><span class="font-mono">{airport.code}</span>{#if airport.name}{" "}<span
        class="text-sm text-muted-foreground">{airport.name}</span
      >{/if}</span
  >
{/if}
