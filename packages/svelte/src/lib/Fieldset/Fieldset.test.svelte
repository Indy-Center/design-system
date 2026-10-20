<!-- A Fieldset of real options for Fieldset.test.ts: two Checkboxes or two
     Radios, so the tests can see what the Fieldset hands them. -->
<script lang="ts">
  import Checkbox from "../Checkbox/Checkbox.svelte";
  import Radio from "../Radio/Radio.svelte";
  import Fieldset from "./Fieldset.svelte";

  type Props = {
    /** Which options to put in it. */
    options: "checkbox" | "radio";
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
  {:else}
    <Radio label="Ground" name="position" value="gnd" />
    <Radio label="Tower" name="position" value="twr" />
  {/if}
</Fieldset>
