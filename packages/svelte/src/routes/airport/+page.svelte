<script lang="ts">
  import { Airport } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const kind = { code: "KIND", name: "Indianapolis International" };
  const kcvg = {
    code: "KCVG",
    name: "Cincinnati/Northern Kentucky International",
  };
  const klex = { code: "KLEX", name: "Blue Grass" };
</script>

<Schemes>
  <div class="space-y-4 pb-8 text-foreground">
    <ul class="space-y-1">
      <li><Airport airport={kind} /></li>
      <li><Airport airport={kcvg} /></li>
      <li><Airport airport={{ code: "KXMP" }} /></li>
    </ul>
    <p class="rounded-md bg-card p-3 text-sm">
      Departures from <Airport airport={klex} nameAt="tooltip" focusable />
      and <Airport airport={kcvg} nameAt="tooltip" focusable /> are on the north flow.
    </p>
  </div>
</Schemes>
