<script lang="ts">
  import {
    mdiThemeLightDark,
    mdiWeatherNight,
    mdiWhiteBalanceSunny,
  } from "@mdi/js";
  import { onMount } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import { clearColorScheme } from "../colorScheme/clearColorScheme.js";
  import {
    colorSchemeChoice,
    readColorSchemeChoice,
  } from "../colorScheme/colorSchemeChoice.svelte.js";
  import { getColorScheme } from "../colorScheme/colorSchemeContext.js";
  import { saveColorScheme } from "../colorScheme/saveColorScheme.js";
  import ChoiceRow from "../preferenceControl/ChoiceRow.svelte";
  import WhatsSaved from "../preferenceControl/WhatsSaved.svelte";

  type Props = Omit<HTMLFieldsetAttributes, "children">;

  let { class: className, ...rest }: Props = $props();

  const { fallback, domain } = getColorScheme();
  // Under `fallback: 'dark'` the next page is dark whatever the device
  // says, so following the device isn't offered, and nothing saved is dark.
  const followsDevice = fallback === "device";

  // The cookie is the browser's to read: until then no row is ticked.
  onMount(readColorSchemeChoice);
  const choice = $derived(
    colorSchemeChoice.current === "device" && !followsDevice
      ? "dark"
      : colorSchemeChoice.current,
  );
</script>

<fieldset {...rest} class={["min-w-0", className]}>
  <legend class="px-3 text-sm text-foreground-soft">Colour scheme</legend>
  <div class="mt-1 space-y-0.5">
    <ChoiceRow
      icon={mdiWhiteBalanceSunny}
      pressed={choice === "light"}
      onclick={() => saveColorScheme("light", { domain })}>Light</ChoiceRow
    >
    <ChoiceRow
      icon={mdiWeatherNight}
      pressed={choice === "dark"}
      onclick={() => saveColorScheme("dark", { domain })}>Dark</ChoiceRow
    >
    {#if followsDevice}
      <ChoiceRow
        icon={mdiThemeLightDark}
        pressed={choice === "device"}
        onclick={() => clearColorScheme({ domain })}
        >Use my device's setting</ChoiceRow
      >
    {/if}
  </div>
  <WhatsSaved
    note="Saved on this browser for a year, across flyindycenter.com."
  />
</fieldset>
