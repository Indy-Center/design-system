<script lang="ts">
  import { SearchInput } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import SearchAndFilterBar from "../../playground/SearchAndFilterBar.svelte";
</script>

<svelte:head><title>SearchInput · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  SearchInput
</h1>

<Schemes>
  <div class="space-y-4">
    <SearchInput label="Search the roster" placeholder="Name or CID" />
    <SearchInput label="Search users" hideLabel placeholder="Name or CID" />
    <SearchAndFilterBar />
  </div>
</Schemes>
