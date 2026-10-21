<script lang="ts">
  // A modal as a page opens one, from a button, for Modal.test.ts.
  import type { ComponentProps } from "svelte";
  import Modal from "./Modal.svelte";

  type Props = Omit<
    ComponentProps<typeof Modal>,
    "children" | "title" | "actions"
  > & { withActions?: boolean };

  let { open = $bindable(false), withActions, ...props }: Props = $props();
</script>

<button type="button" onclick={() => (open = true)}>Request position</button>

<Modal bind:open title="Request position" {...props}>
  <label>
    Position
    <input type="text" />
  </label>
  {#snippet actions()}
    {#if withActions}
      <button type="button" onclick={() => (open = false)}>Send request</button>
    {/if}
  {/snippet}
</Modal>
