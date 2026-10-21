<script lang="ts">
  import { onMount } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { getTimeZone } from "../timeZone/timeZoneContext.svelte.js";
  import { abbreviationOf, cityOf } from "../timeZone/zoneNames.js";

  type Props = Omit<HTMLAttributes<HTMLParagraphElement>, "children">;

  let { class: className, ...rest }: Props = $props();

  const timeZone = getTimeZone();
  let mounted = $state(false);
  onMount(() => {
    timeZone.mount();
    mounted = true;
  });

  // The zone the page's times are drawn in, as `Time` draws them.
  const zone = $derived(timeZone.zone(mounted));
  // The device's, for the offer; the browser's alone.
  const device = $derived(mounted ? timeZone.device : undefined);

  const button = [
    "min-h-11 cursor-pointer rounded-sm text-link underline underline-offset-4 hover:decoration-2",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  ];
</script>

<p
  {...rest}
  class={[
    "flex min-h-11 flex-wrap items-center gap-x-1 text-sm text-muted-foreground",
    className,
  ]}
>
  {#if zone}
    <span>Times in {cityOf(zone)} time ({abbreviationOf(zone)}) ·</span>
    <button
      type="button"
      class={button}
      onclick={() => timeZone.choose({ kind: "zulu" })}
      >Show times in Zulu</button
    >
  {:else}
    <span>Times are in Zulu{device ? " ·" : ""}</span>
    {#if device}
      <button
        type="button"
        class={button}
        onclick={() => timeZone.choose({ kind: "device" })}
        >Show them in {cityOf(device)} time?</button
      >
    {/if}
  {/if}
</p>
