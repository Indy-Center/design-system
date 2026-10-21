<!-- An Airport in a table cell, for Airport.test.ts: a cell takes its name
     from its content, so the test can read what a screen reader says. -->
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Airport from "./Airport.svelte";

  let props: ComponentProps<typeof Airport> = $props();
</script>

<table>
  <tbody>
    <tr>
      <td><Airport {...props} /></td>
    </tr>
  </tbody>
</table>
