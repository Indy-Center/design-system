<script lang="ts">
  import { Callout, Prose } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <Prose as="div">
    <p>Departures leave from runway 23 left in a west flow.</p>
    <Callout level="info" class="my-5">
      <p>The tower closes at 2300 local; the TRACON takes the airspace.</p>
    </Callout>
    <Callout level="caution" class="my-5">
      <p>Hold departures behind a heavy for two minutes.</p>
    </Callout>
    <Callout level="danger" class="my-5">
      <p>Never clear an aircraft onto a closed runway.</p>
    </Callout>
    <Callout level="reference" class="my-5">
      <p>
        The airport's diagram is in the <a href="/rich-text">lesson plan</a>.
      </p>
    </Callout>
    <Callout level="caution" label="Wake turbulence" class="my-5">
      <p>The vortex sinks and drifts with the wind.</p>
      <ul>
        <li>Two minutes behind a heavy.</li>
        <li>Three on parallel runways.</li>
      </ul>
    </Callout>
    <p>The rest of the plan follows.</p>
  </Prose>
</Schemes>
