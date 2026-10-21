<script lang="ts">
  import { ChoiceCard, Fieldset } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let certification = $state("app");
</script>

<svelte:head><title>ChoiceCard · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  ChoiceCard
</h1>

<!-- Each copy is its own form, so its radios are their own group. -->
<Schemes>
  <form class="flex flex-col gap-6">
    <Fieldset legend="Certification">
      <ChoiceCard
        type="radio"
        label="Tower"
        name="certification"
        value="twr"
        bind:group={certification}
      >
        Local control at a towered field: runways, the pattern and the surface
        around them.
      </ChoiceCard>
      <ChoiceCard
        type="radio"
        label="Approach"
        name="certification"
        value="app"
        bind:group={certification}
      >
        Radar control of arrivals and departures.
      </ChoiceCard>
      <ChoiceCard
        type="radio"
        label="Center"
        name="certification"
        value="ctr"
        disabled
      >
        Not yet open to you.
      </ChoiceCard>
      <ChoiceCard
        type="radio"
        label="No certification"
        name="certification"
        value=""
        bind:group={certification}
      />
    </Fieldset>

    <Fieldset legend="Emails">
      <ChoiceCard
        type="checkbox"
        label="Events"
        name="emails"
        value="events"
        checked
      >
        Group flights, fly-ins and FNOs.
      </ChoiceCard>
      <ChoiceCard
        type="checkbox"
        label="Training"
        name="emails"
        value="training"
      />
    </Fieldset>
  </form>
</Schemes>

<p class="mt-4 text-foreground-soft">Chosen: {certification || "none"}</p>
