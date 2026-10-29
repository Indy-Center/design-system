<!-- Choice cards for ChoiceCard.test.ts: a radio group of certifications,
     or a checkbox group of emails, in a Fieldset. -->
<script lang="ts">
  import Fieldset from "../Fieldset/Fieldset.svelte";
  import ChoiceCard from "./ChoiceCard.svelte";

  type Props = {
    /** Which group to show. */
    type: "radio" | "checkbox";
    /** The chosen certification, bindable. */
    group?: string;
    /** Whether the events card is ticked, bindable. */
    events?: boolean;
  };

  let {
    type,
    group = $bindable(),
    events = $bindable(false),
  }: Props = $props();
</script>

{#if type === "radio"}
  <Fieldset legend="Certification">
    <ChoiceCard type="radio" label="Tower" name="cert" value="twr" bind:group>
      Local control at a towered field
    </ChoiceCard>
    <ChoiceCard
      type="radio"
      label="Approach"
      name="cert"
      value="app"
      bind:group
    >
      Radar approach control
    </ChoiceCard>
    <ChoiceCard type="radio" label="None" name="cert" value="" bind:group />
  </Fieldset>
{:else}
  <Fieldset legend="Emails">
    <ChoiceCard
      type="checkbox"
      label="Events"
      name="emails"
      value="events"
      bind:checked={events}
    >
      Group flights and fly-ins
    </ChoiceCard>
    <ChoiceCard
      type="checkbox"
      label="Training"
      name="emails"
      value="training"
    />
  </Fieldset>
{/if}
