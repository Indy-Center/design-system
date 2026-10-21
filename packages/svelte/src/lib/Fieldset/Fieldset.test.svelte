<!-- A Fieldset of real options for Fieldset.test.ts: two Checkboxes, Radios
     or Switches, so the tests can see what the Fieldset hands them. -->
<script lang="ts">
  import Checkbox from "../Checkbox/Checkbox.svelte";
  import Radio from "../Radio/Radio.svelte";
  import Switch from "../Switch/Switch.svelte";
  import Fieldset from "./Fieldset.svelte";

  type Props = {
    /** Which options to put in it. */
    options: "checkbox" | "radio" | "switch";
    /** The Fieldset's error. */
    error?: string;
    /** The Fieldset's `required`. */
    required?: boolean;
  };

  let { options, error, required }: Props = $props();
</script>

<Fieldset legend="Position" {error} {required}>
  {#if options === "checkbox"}
    <Checkbox label="Ground" name="position" value="gnd" />
    <Checkbox label="Tower" name="position" value="twr" />
  {:else if options === "switch"}
    <Switch label="Ground" name="gnd" />
    <Switch label="Tower" name="twr" />
  {:else}
    <Radio label="Ground" name="position" value="gnd" />
    <Radio label="Tower" name="position" value="twr" />
  {/if}
</Fieldset>
