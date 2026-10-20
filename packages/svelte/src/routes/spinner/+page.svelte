<script lang="ts">
  import { Spinner } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>Spinner · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Spinner
</h1>

<p class="mb-4">
  Turn on "reduce motion" in the device's settings and the spinners hold still.
</p>

<Schemes>
  <ul class="space-y-3">
    <li class="flex items-center gap-2">
      <Spinner /> Loading the roster…
    </li>
    <li class="flex items-center gap-2 text-2xl text-foreground">
      <Spinner label="Saving" /> Larger text
    </li>
    <li class="flex items-center gap-2 text-link">
      <Spinner label="Signing in" /> In the link role
    </li>
  </ul>
</Schemes>
