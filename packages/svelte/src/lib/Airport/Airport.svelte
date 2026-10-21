<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import type { AirportInfo } from "../aviation/airport.js";
  import AbbrTooltip from "../AbbrTooltip/AbbrTooltip.svelte";

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
  <AbbrTooltip
    {...rest}
    code={airport.code}
    name={airport.name}
    {focusable}
    boxClass={className}
    class="font-mono"
  />
{:else}
  <span {...rest} class={className}
    ><span class="font-mono">{airport.code}</span>{#if airport.name}{" "}<span
        class="text-sm text-muted-foreground">{airport.name}</span
      >{/if}</span
  >
{/if}
