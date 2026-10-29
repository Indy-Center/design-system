<!-- A radio group for Radio.test.ts: three radios in a Fieldset. -->
<script lang="ts">
  import Fieldset from "../Fieldset/Fieldset.svelte";
  import Radio from "./Radio.svelte";

  type Props = {
    /** The chosen value, bindable. */
    group?: string;
    /** Whether the radios bind `group`, or only read it. */
    bound?: boolean;
  };

  let { group = $bindable(), bound = true }: Props = $props();
</script>

<Fieldset legend="Position">
  {#if bound}
    <Radio label="Ground" name="position" value="gnd" bind:group />
    <Radio label="Tower" name="position" value="twr" bind:group />
    <Radio label="Approach" name="position" value="app" bind:group />
  {:else}
    <Radio label="Ground" name="position" value="gnd" {group} />
    <Radio label="Tower" name="position" value="twr" {group} />
    <Radio label="Approach" name="position" value="app" {group} />
  {/if}
</Fieldset>
