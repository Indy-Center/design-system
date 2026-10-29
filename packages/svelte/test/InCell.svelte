<!-- Puts `component` in a table cell, for Credential's, Airport's and
     Member's tests: a cell takes its name from its content, so a test can
     read what a screen reader says. -->
<script lang="ts">
  import type { Component } from "svelte";

  type Props = {
    /** The component under test. Its props aren't checked here: each
        test passes ones it also renders the component with alone. */
    component: Component<any>;
    /** Its props. */
    props: Record<string, unknown>;
  };

  let { component: Shown, props }: Props = $props();
</script>

<table>
  <tbody>
    <tr>
      <td><Shown {...props} /></td>
    </tr>
  </tbody>
</table>
