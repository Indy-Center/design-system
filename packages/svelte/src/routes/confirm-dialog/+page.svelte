<script lang="ts">
  import { Button, confirmAction, toast, Toaster } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import DeleteEvent from "./DeleteEvent.svelte";

  async function withdraw() {
    const sure = await confirmAction({
      title: "Withdraw request?",
      message: "Your request for ZID_CTR on Friday will be withdrawn.",
      confirmLabel: "Withdraw request",
    });
    toast("info", sure ? "Request withdrawn." : "Kept the request.");
  }
</script>

<svelte:head><title>ConfirmDialog · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  ConfirmDialog
</h1>

<p class="mb-4">
  Placed in each scheme, with <code>danger</code>: focus starts on Cancel. A
  toast says which way it went.
</p>

<Schemes>
  <DeleteEvent />
</Schemes>

<p class="mt-6 mb-4">
  Raised with <code>confirmAction()</code>, in the page's scheme: focus starts
  on the confirm button.
</p>
<Button variant="secondary" onclick={withdraw}>Withdraw request</Button>

<div style="--centerline-header-height: 3.25rem">
  <Toaster />
</div>
