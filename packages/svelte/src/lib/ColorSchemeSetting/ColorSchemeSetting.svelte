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
  import { saveColorScheme } from "../colorScheme/saveColorScheme.js";
  import ChoiceRow from "../preferenceControl/ChoiceRow.svelte";
  import WhatsSaved from "../preferenceControl/WhatsSaved.svelte";

  type Props = Omit<HTMLFieldsetAttributes, "children"> & {
    /** The domain the cookie is shared across; `flyindycenter.com` by default. */
    domain?: string;
  };

  let { domain, class: className, ...rest }: Props = $props();

  // The cookie is the browser's to read: until then no row is ticked.
  onMount(readColorSchemeChoice);
  const choice = $derived(colorSchemeChoice.current);
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
    <ChoiceRow
      icon={mdiThemeLightDark}
      pressed={choice === "device"}
      onclick={() => clearColorScheme({ domain })}
      >Use my device's setting</ChoiceRow
    >
  </div>
  <WhatsSaved
    note="Saved on this browser for a year, across flyindycenter.com."
  />
</fieldset>
