<script lang="ts">
  // The modal specimen, with its own open state, so each scheme opens its
  // own.
  import { Button, Field, Input, Modal } from "../../lib/index.ts";

  let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Request position</Button>
<Modal bind:open title="Request position">
  <p class="mb-4">Ask the event coordinator for a position at FNO Chicago.</p>
  <Field label="Position" hint="A callsign, such as ORD_TWR.">
    {#snippet children(control)}<Input {...control} />{/snippet}
  </Field>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
    <Button onclick={() => (open = false)}>Send request</Button>
  {/snippet}
</Modal>
