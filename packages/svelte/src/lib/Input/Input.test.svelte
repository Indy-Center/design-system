<!-- An Input for Input.test.ts, bound to a value shown beside it. -->
<script lang="ts">
  import Input from "./Input.svelte";

  let value = $state("IND_CTR");
</script>

<Input aria-label="Callsign" bind:value />
<output>{value}</output>
