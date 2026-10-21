<script lang="ts">
  import { onMount } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { timeText, type TimeShown, type TimeZoneShown } from "./format.js";
  import { now } from "./now.svelte.js";

  type When = Date | string | number;
  // The root is a <time>, or a <span> around a range's <time>s, so only the
  // attributes both take; `Time` sets `datetime` itself.
  type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    /** The instant: a `Date`, an ISO string or milliseconds since the epoch. */
    value: When;
    /** A range's end, for `7:00 PM–10:00 PM EDT`. */
    end?: When;
    /** `"local"` (the default), `"zulu"`, or `"both"`: local, then Zulu. */
    zone?: TimeZoneShown;
    /** `"time"` (the default), `"datetime"` (day first) or `"relative"` ("in 2 h"). */
    show?: TimeShown;
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
  let memberZone = $state<string>();
  onMount(() => {
    memberZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  });

  const pieces = $derived(
    timeText({
      start: new Date(value),
      end: end === undefined ? undefined : new Date(end),
      show,
      zone,
      memberZone,
      now,
    }),
  );
</script>

{#if pieces.length === 1}
  <time {...rest} datetime={pieces[0].at?.toISOString()} class={className}
    >{pieces[0].text}</time
  >
{:else}
  <span {...rest} class={className}>
    {#each pieces as piece, i (i)}
      {#if piece.at}<time datetime={piece.at.toISOString()}>{piece.text}</time
        >{:else}{piece.text}{/if}
    {/each}
  </span>
{/if}
