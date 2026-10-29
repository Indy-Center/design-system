<script lang="ts">
  import { SearchInput } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import SearchAndFilterBar from "../../playground/SearchAndFilterBar.svelte";
</script>

<Schemes>
  <div class="space-y-4">
    <SearchInput label="Search the roster" placeholder="Name or CID" />
    <SearchInput label="Search users" hideLabel placeholder="Name or CID" />
    <SearchAndFilterBar />
  </div>
</Schemes>
