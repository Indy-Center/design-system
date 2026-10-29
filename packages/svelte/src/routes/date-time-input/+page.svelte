<script lang="ts">
  import { DateTimeInput, Field, Link, setTimeZone } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let { data } = $props();
  setTimeZone(() => data.timeZone);

  let start = $state<string | undefined>("2026-10-27T23:00:00.000Z");
</script>

<p class="mb-6 max-w-prose">
  The box is in the time zone saved on
  <Link href="/time-zone-setting">the time-zone setting</Link>, as every
  <code class="font-mono">Time</code> is; with nothing saved, this device's.
</p>

<Schemes>
  <form class="space-y-4" onsubmit={(event) => event.preventDefault()}>
    <Field label="Start" hint="When the event opens." required>
      {#snippet children(control)}
        <DateTimeInput {...control} name="start" bind:value={start} />
      {/snippet}
    </Field>
    <p class="font-mono text-sm text-muted-foreground">{start ?? "empty"}</p>
    <Field label="End">
      {#snippet children(control)}
        <DateTimeInput {...control} name="end" />
      {/snippet}
    </Field>
    <Field label="Booked" error="Pick a time after the session opens.">
      {#snippet children(control)}
        <DateTimeInput {...control} value="2026-10-28T01:00:00.000Z" />
      {/snippet}
    </Field>
    <DateTimeInput
      aria-label="Disabled"
      disabled
      value="2026-10-20T23:00:00.000Z"
    />
  </form>
</Schemes>
