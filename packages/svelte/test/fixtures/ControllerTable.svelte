<script lang="ts">
  // A table as a page writes one, for Table's tests: column headers, a row
  // header, and a link in a cell for a row that goes somewhere.
  import Link from "../../src/lib/Link/Link.svelte";
  import Table from "../../src/lib/Table/Table.svelte";
  import Th from "../../src/lib/Table/Th.svelte";

  let { hideCaption = false }: { hideCaption?: boolean } = $props();
</script>

<Table {hideCaption}>
  {#snippet caption()}Online controllers{/snippet}
  <thead>
    <tr>
      <Th scope="col">Callsign</Th>
      <Th scope="col">Frequency</Th>
      <Th scope="col">Controller</Th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <Th scope="row">IND_83_CTR</Th>
      <td>128.225</td>
      <td><Link href="/roster/1234567">Jane Doe</Link></td>
    </tr>
  </tbody>
</Table>
