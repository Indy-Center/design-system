<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { formatFrequency, spokenFrequency } from "../aviation/frequency.js";
  import { resolvePosition } from "../aviation/resolvePosition.js";
  import { getPositions } from "../positions/positionsContext.js";
  import { toHertz } from "./hertz.js";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** In hertz (`128225000`), or megahertz as written (`"128.225"`). Wins over `callsign`. */
    value?: number | string;
    /** A position's callsign, to look its frequency up from the page's positions. */
    callsign?: string;
    /** `2` (the default) or `3`: the third decimal, for 8.33 kHz spacing. */
    decimals?: 2 | 3;
  };

  let {
    value,
    callsign,
    decimals = 2,
    class: className,
    ...rest
  }: Props = $props();

  const positions = getPositions();
  const hz = $derived(
    value !== undefined
      ? toHertz(value)
      : callsign !== undefined
        ? resolvePosition(callsign, positions())?.position.frequency
        : undefined,
  );
  // formatFrequency gives three decimals; the third is cut, not rounded.
  const shown = (hz: number) =>
    decimals === 3 ? formatFrequency(hz) : formatFrequency(hz).slice(0, -1);
</script>

{#if hz !== undefined}
  <span {...rest} class={["font-mono tabular-nums", className]}
    ><span aria-hidden="true">{shown(hz)}</span><span class="sr-only"
      >{spokenFrequency(hz)}</span
    ></span
  >
{/if}
