<script lang="ts">
  // The search-and-filter bar from SearchInput's doc page: a search, a chip
  // per filter, and a Select for the sort, for SearchInput's and
  // FilterChip's playground pages.
  import { FilterChip, SearchInput, Select } from "../lib/index.ts";

  let query = $state("");
  let onlineOnly = $state(false);
  let visitors = $state(true);
  let sort = $state("initials");
</script>

<div class="flex flex-wrap items-center gap-3">
  <SearchInput
    label="Search the roster"
    hideLabel
    placeholder="Name or CID"
    bind:value={query}
    class="w-full sm:w-64"
  />
  <div role="group" aria-label="Show" class="flex flex-wrap gap-2">
    <FilterChip bind:pressed={onlineOnly}>Online only</FilterChip>
    <FilterChip bind:pressed={visitors} count={14}>Visitors</FilterChip>
  </div>
  <Select aria-label="Sort by" bind:value={sort} class="sm:ml-auto sm:w-48">
    <option value="initials">Initials</option>
    <option value="name">Name</option>
    <option value="rating">Rating</option>
  </Select>
</div>
