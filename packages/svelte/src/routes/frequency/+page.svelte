<script lang="ts">
  import { DescriptionList, Frequency, setPositions } from "../../lib/index.ts";
  import { samplePositions } from "../../playground/positions.ts";
  import Schemes from "../../playground/Schemes.svelte";

  // An app's layout sets them from fetchPositions("ZID").
  setPositions(() => samplePositions);
</script>

<svelte:head><title>Frequency · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Frequency
</h1>

<Schemes>
  <DescriptionList>
    <div>
      <dt>IND_83_CTR</dt>
      <dd><Frequency callsign="IND_83_CTR" /></dd>
    </div>
    <div>
      <dt>Relief login</dt>
      <dd><Frequency callsign="IND_831_CTR" /></dd>
    </div>
    <div>
      <dt>Second decimal zero</dt>
      <dd><Frequency value={121900000} /></dd>
    </div>
    <div>
      <dt>As written</dt>
      <dd><Frequency value="118.825" /></dd>
    </div>
    <div>
      <dt>Three decimals</dt>
      <dd><Frequency value={128225000} decimals={3} /></dd>
    </div>
  </DescriptionList>
</Schemes>
