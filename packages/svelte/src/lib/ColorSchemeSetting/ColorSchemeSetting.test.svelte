<!-- Stands in for an app's root layout in the colour-scheme tests: hands the
     hook's setup to setColorScheme (when given a fallback), then places the
     control, twice to show the user menu and a settings page together. -->
<script lang="ts">
  import {
    setColorScheme,
    type SetColorSchemeOptions,
  } from "../colorScheme/colorSchemeContext.js";
  import ColorSchemeSetting from "./ColorSchemeSetting.svelte";

  type Props = Partial<SetColorSchemeOptions> & {
    /** How many controls to place. */
    count?: number;
    /** Added to each control. */
    class?: string;
  };

  let { fallback, domain, count = 1, class: className }: Props = $props();
  // As an app's layout: the setup doesn't change while the page is open.
  // svelte-ignore state_referenced_locally
  if (fallback) setColorScheme({ fallback, domain });
</script>

{#each { length: count }, i (i)}
  <ColorSchemeSetting class={className} />
{/each}
