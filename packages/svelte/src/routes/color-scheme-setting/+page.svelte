<script lang="ts">
  // Served by the colour-scheme hook with `fallback: 'device'`
  // (src/hooks.server.ts), so a choice holds after a reload.
  import { ColorSchemeSetting } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head
  ><title>Colour-scheme setting · Centerline playground</title></svelte:head
>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Colour-scheme setting
</h1>

<p class="mb-6 max-w-prose">
  A choice applies to the whole page at once, so Light and Dark turn the light
  columns below too; the dark ones stay dark. Reload, and the server serves it.
  "Use my device's setting" deletes the cookie and follows the device.
</p>

<Schemes>
  <ColorSchemeSetting />
</Schemes>
