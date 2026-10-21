<script lang="ts">
  import { setTimeZone, TimeZoneSetting } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import TimeZoneReadout from "../../playground/TimeZoneReadout.svelte";

  let { data } = $props();

  // A pretend profile, as a signed-in member's would be saved.
  let profile = $state<string>();
  setTimeZone(() => data.timeZone, {
    saveToProfile: (setting) => (profile = setting),
  });
</script>

<svelte:head
  ><title>Time-zone setting · Centerline playground</title></svelte:head
>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Time-zone setting
</h1>

<div class="mb-6 max-w-prose space-y-4">
  <p>
    A choice applies at once and is saved to the cookie; reload, and the server
    draws the event in it. With nothing saved, the server draws Zulu and the
    browser switches to this device's zone.
  </p>
  <TimeZoneReadout {profile} />
</div>

<Schemes>
  <TimeZoneSetting />
</Schemes>
