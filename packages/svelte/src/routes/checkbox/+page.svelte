<script lang="ts">
  import { Checkbox } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <Checkbox label="Visiting controller" />
  <Checkbox label="Show on the roster" checked />
  <Checkbox label="Can't change this" disabled />
  <Checkbox label="Nor this" disabled checked />
  <Checkbox
    label="I've read the training policy"
    error="Tick this to send the form."
  />
</Schemes>
