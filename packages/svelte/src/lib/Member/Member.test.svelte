<!-- A Member in a roster's table cell, for Member.test.ts: a cell takes its
     name from its content, so the test can read what a screen reader says. -->
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Member from "./Member.svelte";

  let props: ComponentProps<typeof Member> = $props();
</script>

<table>
  <tbody>
    <tr>
      <td><Member {...props} /></td>
    </tr>
  </tbody>
</table>
