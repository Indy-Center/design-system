<script lang="ts">
  import { Checkbox, Fieldset, Radio } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<!-- Each copy is its own form, so its radios are their own group. -->
<Schemes>
  <form class="space-y-6" onsubmit={(event) => event.preventDefault()}>
    <Fieldset legend="Position" hint="The one you'll train on first." required>
      <Radio label="Ground" name="position" value="gnd" />
      <Radio label="Tower" name="position" value="twr" />
      <Radio label="Approach" name="position" value="app" />
    </Fieldset>
    <Fieldset legend="Emails" error="Choose at least one.">
      <Checkbox label="Events" name="emails" value="events" />
      <Checkbox label="Training" name="emails" value="training" />
    </Fieldset>
  </form>
</Schemes>
