<script lang="ts">
  import { Fieldset, Radio } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let position = $state("twr");
</script>

<!-- Each copy is its own form, so its radios are their own group. -->
<Schemes>
  <form>
    <Fieldset legend="Position">
      <Radio label="Ground" name="position" value="gnd" bind:group={position} />
      <Radio label="Tower" name="position" value="twr" bind:group={position} />
      <Radio
        label="Approach"
        name="position"
        value="app"
        bind:group={position}
      />
      <Radio label="Center" name="position" value="ctr" disabled />
    </Fieldset>
  </form>
</Schemes>

<p class="mt-4 text-foreground-soft">Chosen: {position}</p>
