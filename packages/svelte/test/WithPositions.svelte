<script lang="ts">
  // Stands in for an app's layout in Position's and Frequency's tests: sets
  // the page's positions, then renders `component` with `props` below it.
  import type { Component } from "svelte";
  import type { VnasPosition } from "../src/lib/aviation/resolvePosition.ts";
  import { setPositions } from "../src/lib/positions/positionsContext.ts";

  type Props = {
    /** As the app's server load returns them. */
    positions: VnasPosition[];
    /** The component under test, Position or Frequency. Its props aren't
        checked here: the tests' own helpers type them. */
    component: Component<any>;
    /** Its props. */
    props: Record<string, unknown>;
  };

  let { positions, component: Shown, props }: Props = $props();
  setPositions(() => positions);
</script>

<Shown {...props} />
