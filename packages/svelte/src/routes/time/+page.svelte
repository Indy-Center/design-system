<script lang="ts">
  import { Time } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  // Times around now, on the hour, so the day words show.
  const hour = 3_600_000;
  const base = Math.ceil(Date.now() / hour) * hour;
  const at = (hours: number) => new Date(base + hours * hour);
</script>

<svelte:head><title>Time · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Time</h1>

<p class="mb-4">
  The server draws these in Zulu; they switch to this browser's zone once the
  page loads. Reload to see it.
</p>

<Schemes>
  <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
    <dt class="text-muted-foreground">Local</dt>
    <dd><Time value={at(2)} /></dd>
    <dt class="text-muted-foreground">Both</dt>
    <dd><Time value={at(2)} zone="both" /></dd>
    <dt class="text-muted-foreground">Zulu</dt>
    <dd><Time value={at(2)} zone="zulu" /></dd>
    <dt class="text-muted-foreground">Tomorrow</dt>
    <dd><Time value={at(24)} show="datetime" zone="both" /></dd>
    <dt class="text-muted-foreground">This week</dt>
    <dd><Time value={at(72)} show="datetime" /></dd>
    <dt class="text-muted-foreground">Next week</dt>
    <dd><Time value={at(7 * 24)} show="datetime" /></dd>
    <dt class="text-muted-foreground">Next year</dt>
    <dd><Time value={at(365 * 24)} show="datetime" /></dd>
    <dt class="text-muted-foreground">Event</dt>
    <dd>
      <Time value={at(2)} end={at(5)} show="datetime" zone="both" />
    </dd>
    <dt class="text-muted-foreground">Starts</dt>
    <dd><Time value={at(2)} show="relative" /></dd>
    <dt class="text-muted-foreground">Online</dt>
    <dd><Time value={Date.now() - 83 * 60_000} show="relative" /></dd>
  </dl>
</Schemes>
