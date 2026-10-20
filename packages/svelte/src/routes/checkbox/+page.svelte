<script lang="ts">
  import { Checkbox } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>Checkbox · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Checkbox
</h1>

<Schemes>
  <Checkbox label="Visiting controller" />
  <Checkbox label="Show on the roster" checked />
  <Checkbox label="Can't change this" disabled />
  <Checkbox label="Nor this" disabled checked />
  <Checkbox
    label="I've read the training policy"
    error="Tick this to send the form."
  />
</Schemes>
