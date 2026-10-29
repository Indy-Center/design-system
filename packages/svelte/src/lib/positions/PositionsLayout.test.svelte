<!-- Stands in for an app's layout in positions.test.ts: sets the page's
     positions once, and shows a lookup for each callsign. -->
<script lang="ts">
  import type { PositionInfo } from "../aviation/resolvePosition.js";
  import PositionName from "./PositionName.test.svelte";
  import { setPositions } from "./positionsContext.js";

  type Props = {
    /** As the app's server load returns them. */
    positions: PositionInfo[];
    /** One lookup is shown for each. */
    callsigns: string[];
  };

  let { positions, callsigns }: Props = $props();
  setPositions(() => positions);
</script>

{#each callsigns as callsign (callsign)}
  <PositionName {callsign} />
{/each}
