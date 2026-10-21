<script lang="ts">
  import { setTimeZone, Time, TimeZoneLine } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import TimeZoneReadout from "../../playground/TimeZoneReadout.svelte";

  let { data } = $props();

  let profile = $state<string>();
  setTimeZone(() => data.timeZone, {
    saveToProfile: (setting) => (profile = setting),
  });

  const hour = 3_600_000;
  const base = Math.ceil(Date.now() / hour) * hour;
  const events = [
    { title: "FNO: Midwest Madness", start: base + 26 * hour, hours: 4 },
    { title: "OTS: IND_APP", start: base + 50 * hour, hours: 1.5 },
  ];
</script>

<svelte:head><title>Time-zone line · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Time-zone line
</h1>

<div class="mb-6 max-w-prose">
  <TimeZoneReadout {profile} />
</div>

<Schemes>
  <TimeZoneLine class="mb-2" />
  <ul class="divide-y divide-border rounded-lg border border-border bg-card">
    {#each events as event (event.title)}
      <li class="p-3">
        <p class="font-semibold text-foreground">{event.title}</p>
        <Time
          value={event.start}
          end={event.start + event.hours * hour}
          show="datetime"
          zone="both"
        />
      </li>
    {/each}
  </ul>
</Schemes>
