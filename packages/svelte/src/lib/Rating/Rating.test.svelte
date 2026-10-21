<!-- A Rating in a roster's table cell, for Rating.test.ts: a cell takes its
     name from its content, so the test can read what a screen reader says. -->
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Rating from "./Rating.svelte";

  let props: ComponentProps<typeof Rating> = $props();
</script>

<table>
  <tbody>
    <tr>
      <td><Rating {...props} /></td>
    </tr>
  </tbody>
</table>
