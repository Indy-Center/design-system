<script lang="ts">
  import { onMount } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { pieces, relative, type TimeZoneShown } from "./format.js";

  type When = Date | string | number;
  // A range is a <span> around its <time>s; the attributes go on whichever
  // is the root.
  type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    /** The instant: a `Date`, an ISO string or milliseconds since the epoch. */
    value: When;
    /** A range's end, for `7:00 PM–10:00 PM EDT`. */
    end?: When;
    /** `"local"` (the default), `"zulu"`, or `"both"`: local, then Zulu. */
    zone?: TimeZoneShown;
    /**
     * `"time"` (the default); `"datetime"` for the day before it; or
     * `"relative"` for "in 2 h" or "1 h 23 m", counting each minute.
     */
    show?: "time" | "datetime" | "relative";
  };
  let {
    value,
    end,
    zone = "local",
    show = "time",
    class: className,
    ...rest
  }: Props = $props();

  // The server can't know the member's zone, so it draws Zulu; the browser
  // switches to its own zone once mounted.
  let timeZone = $state<string>();
  let now = $state(new Date());
  onMount(() => {
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (show !== "relative") return;
    const timer = setInterval(() => (now = new Date()), 60_000);
    return () => clearInterval(timer);
  });

  const start = $derived(new Date(value));
  const shown = $derived(
    show === "relative"
      ? [{ text: relative(start, now), at: start }]
      : pieces({
          start,
          end: end === undefined ? undefined : new Date(end),
          date: show === "datetime",
          zone,
          timeZone,
          now,
        }),
  );
</script>

{#if shown.length === 1}
  <time {...rest} datetime={shown[0].at?.toISOString()} class={className}
    >{shown[0].text}</time
  >
{:else}
  <span {...rest} class={className}>
    {#each shown as piece, i (i)}
      {#if piece.at}<time datetime={piece.at.toISOString()}>{piece.text}</time
        >{:else}{piece.text}{/if}
    {/each}
  </span>
{/if}
