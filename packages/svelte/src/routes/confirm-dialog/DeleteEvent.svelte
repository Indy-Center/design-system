<script lang="ts">
  // The placed ConfirmDialog specimen, with its own open state, so each
  // scheme opens its own.
  import { Button, ConfirmDialog, toast } from "../../lib/index.ts";

  let open = $state(false);
</script>

<Button variant="danger" onclick={() => (open = true)}>Delete event</Button>
<ConfirmDialog
  bind:open
  title="Delete event?"
  confirmLabel="Delete event"
  danger
  onconfirm={() => toast("success", "Event deleted.")}
  oncancel={() => toast("info", "Kept the event.")}
>
  <p><strong>FNO Chicago</strong> will be removed for everyone.</p>
</ConfirmDialog>
