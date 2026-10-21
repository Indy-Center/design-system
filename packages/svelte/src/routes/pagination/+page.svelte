<script lang="ts">
  import { Pagination } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let few = $state(1);
  let many = $state(10);
</script>

<svelte:head><title>Pagination · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Pagination
</h1>

<Schemes>
  <p class="mb-2">Page {few} of 4</p>
  <Pagination bind:page={few} pageCount={4} label="Short list pages" />
  <p class="mt-6 mb-2">Page {many} of 120</p>
  <Pagination bind:page={many} pageCount={120} label="Long list pages" />
</Schemes>
