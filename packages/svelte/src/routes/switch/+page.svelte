<script lang="ts">
  import { Fieldset, Switch } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let events = $state(true);
</script>

<svelte:head><title>Switch · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Switch</h1>

<Schemes>
  <Fieldset legend="Emails">
    <Switch label="Email me about events" bind:checked={events} />
    <Switch label="Email me about training">
      New courses and exam dates, about once a month
    </Switch>
    <Switch label="Can't change this" disabled />
    <Switch label="Nor this" disabled checked />
  </Fieldset>
</Schemes>

<p class="mt-4 text-foreground-soft">Events: {events ? "on" : "off"}</p>
