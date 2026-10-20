<!-- A radio group for Radio.test.ts: three radios in a Fieldset, and a
     button after it. -->
<script lang="ts">
  import Fieldset from "../Fieldset/Fieldset.svelte";
  import Radio from "./Radio.svelte";

  type Props = {
    /** The chosen value, bindable. */
    group?: string;
  };

  let { group = $bindable() }: Props = $props();
</script>

<Fieldset legend="Position">
  <Radio label="Ground" name="position" value="gnd" bind:group />
  <Radio label="Tower" name="position" value="twr" bind:group />
  <Radio label="Approach" name="position" value="app" bind:group />
</Fieldset>
<button type="button">Next</button>
