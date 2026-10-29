<!-- Stands in for Position in positions.test.ts: looks a callsign up in the
     page's positions and shows its radio name. -->
<script lang="ts">
  import { resolvePosition } from "../aviation/resolvePosition.js";
  import { getPositions } from "./positionsContext.js";

  type Props = {
    /** The callsign to look up. */
    callsign: string;
  };

  let { callsign }: Props = $props();
  const positions = getPositions();
  const found = $derived(resolvePosition(callsign, positions()));
</script>

<p>{callsign}: {found?.position.radioName ?? "unknown"}</p>
