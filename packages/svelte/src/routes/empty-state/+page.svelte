<script lang="ts">
  import { mdiAccountGroup, mdiCalendar, mdiPlus } from "@mdi/js";
  import { Button, EmptyState, Icon } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>EmptyState · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  EmptyState
</h1>

<Schemes>
  <EmptyState title="No events scheduled" level={2}>
    {#snippet icon()}<Icon path={mdiCalendar} />{/snippet}
    New events show here once staff publish them.
  </EmptyState>
</Schemes>

<!-- In a panel, with an action. -->
<div class="mt-4">
  <Schemes>
    <div class="rounded-lg border border-border bg-card">
      <EmptyState title="No positions configured" level={3}>
        {#snippet icon()}<Icon path={mdiAccountGroup} />{/snippet}
        Add positions to this event to get started with controller assignments.
        {#snippet action()}
          <Button><Icon path={mdiPlus} />Add positions</Button>
        {/snippet}
      </EmptyState>
    </div>
  </Schemes>
</div>

<!-- One line in a panel. -->
<div class="mt-4">
  <Schemes>
    <div class="rounded-lg border border-border bg-card">
      <EmptyState size="inline" class="px-4 py-5">No sessions yet.</EmptyState>
    </div>
  </Schemes>
</div>
