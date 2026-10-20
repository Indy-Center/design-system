<script lang="ts">
  import { Radio } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let position = $state("twr");
</script>

<svelte:head><title>Radio · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Radio</h1>

<!-- Each copy is its own form, so its radios are their own group. -->
<Schemes>
  <form>
    <Radio label="Ground" name="position" value="gnd" bind:group={position} />
    <Radio label="Tower" name="position" value="twr" bind:group={position} />
    <Radio label="Approach" name="position" value="app" bind:group={position} />
    <Radio label="Center" name="position" value="ctr" disabled />
  </form>
</Schemes>

<p class="mt-4 text-foreground-soft">Chosen: {position}</p>
