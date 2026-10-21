<!-- A Combobox for Combobox.test.ts whose search function is written
     inline, as the doc's example has it, beside a counter the page
     changes. Each search is reported to `onsearch`. -->
<script lang="ts">
  import Combobox from "./Combobox.svelte";

  type Props = { onsearch: (query: string) => void };

  let { onsearch }: Props = $props();
  let count = $state(0);
  const roster = ["Ann Archer", "Dan Andrews"];
</script>

<Combobox
  aria-label="Controller"
  options={async (query) => {
    onsearch(query);
    return roster.filter((name) => name.includes(query));
  }}
/>
<button type="button" onclick={() => count++}>Count {count}</button>
