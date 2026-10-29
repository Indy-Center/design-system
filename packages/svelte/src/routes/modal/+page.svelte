<script lang="ts">
  import { Button, Modal } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import RequestPosition from "./RequestPosition.svelte";

  let tall = $state(false);
</script>

<p class="mb-4">
  Each scheme's button opens a modal in that scheme. Close it with Escape, the
  close button, Cancel or a click outside; focus comes back to the button.
</p>

<Schemes>
  <RequestPosition />
</Schemes>

<div class="mt-6">
  <Button variant="secondary" onclick={() => (tall = true)}>
    Open a tall modal
  </Button>
  <Modal bind:open={tall} title="Add positions" size="lg">
    {#each { length: 30 }, i (i)}
      <p class="mb-2">Position row {i + 1}</p>
    {/each}
    {#snippet actions()}
      <Button onclick={() => (tall = false)}>Done</Button>
    {/snippet}
  </Modal>
</div>
