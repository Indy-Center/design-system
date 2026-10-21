<!-- Pagination with `bind:page`, the page shown in a status, and a button
     that sets it from outside. -->
<script lang="ts">
  import Pagination from "./Pagination.svelte";

  let { pageCount }: { pageCount: number } = $props();
  let page = $state(1);
</script>

<Pagination {pageCount} bind:page />
<p role="status">{page}</p>
<button type="button" onclick={() => (page = 2)}>Show page 2</button>
