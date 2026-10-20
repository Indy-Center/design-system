<!-- A disclosure for dismiss.test.ts: a button, its panel, and a button
     elsewhere on the page. -->
<script lang="ts">
  import { dismiss } from "./dismiss.js";

  type Props = {
    /** Whether the panel starts open. */
    open?: boolean;
  };

  let { open = false }: Props = $props();
  let trigger = $state<HTMLButtonElement>();
</script>

<button
  bind:this={trigger}
  type="button"
  aria-expanded={open}
  aria-controls="panel"
  onclick={() => (open = !open)}>Apps</button
>
<div
  id="panel"
  hidden={!open}
  use:dismiss={{ open, trigger, onclose: () => (open = false) }}
>
  <button type="button">Inside</button>
  <p>Some text</p>
</div>
<button type="button">Elsewhere</button>
