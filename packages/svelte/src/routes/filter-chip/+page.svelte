<script lang="ts">
  import { FilterChip } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import SearchAndFilterBar from "../../playground/SearchAndFilterBar.svelte";
</script>

<svelte:head><title>FilterChip · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  FilterChip
</h1>

<Schemes>
  <div class="space-y-4">
    <div role="group" aria-label="Statuses" class="flex flex-wrap gap-2">
      <FilterChip count={12}>Waiting</FilterChip>
      <FilterChip count={4}>Enrolled</FilterChip>
      <FilterChip pressed={false} count={2}>Withdrawn</FilterChip>
      <FilterChip disabled>Disabled on</FilterChip>
      <FilterChip pressed={false} disabled>Disabled off</FilterChip>
    </div>
    <SearchAndFilterBar />
  </div>
</Schemes>
