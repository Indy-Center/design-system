<script lang="ts">
  import {
    mdiAccount,
    mdiCalendar,
    mdiChartLine,
    mdiMessageText,
  } from "@mdi/js";
  import { Icon, StatCard } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>StatCard · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  StatCard
</h1>

<Schemes>
  <div class="grid gap-3">
    <StatCard label="Total users" value={412} detail="287 controllers">
      {#snippet icon()}<Icon path={mdiAccount} />{/snippet}
    </StatCard>
    <StatCard label="Events" value={38} detail="31 published">
      {#snippet icon()}<Icon path={mdiCalendar} />{/snippet}
    </StatCard>
    <StatCard label="Sessions this year" value={12345} />
  </div>
</Schemes>

<!-- A dashboard row: one column on a phone, four on a wide screen. -->
<div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard label="Total users" value={412} detail="287 controllers">
    {#snippet icon()}<Icon path={mdiAccount} />{/snippet}
  </StatCard>
  <StatCard label="Events" value={38} detail="31 published">
    {#snippet icon()}<Icon path={mdiCalendar} />{/snippet}
  </StatCard>
  <StatCard label="Event positions" value={506} detail="412 assigned">
    {#snippet icon()}<Icon path={mdiChartLine} />{/snippet}
  </StatCard>
  <StatCard label="Feedback" value={1204} detail="12 waiting for review">
    {#snippet icon()}<Icon path={mdiMessageText} />{/snippet}
  </StatCard>
</div>
