<script lang="ts">
  import { DateTimeInput, Field } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let start = $state<string | undefined>("2026-10-27T23:00:00.000Z");
</script>

<svelte:head><title>DateTimeInput · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  DateTimeInput
</h1>

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
