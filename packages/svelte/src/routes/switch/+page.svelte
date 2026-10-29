<script lang="ts">
  import { Fieldset, Switch } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let events = $state(true);
</script>

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
