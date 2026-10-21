<script lang="ts">
  import { DEV } from "esm-env";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    isValid,
    timeText,
    type TimeShown,
    type TimeZoneShown,
  } from "./format.js";
  import { memberZone } from "../timeZone/memberZone.svelte.js";
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

  // The member's saved zone, from the root layout's setTimeZone. With none,
  // the server can't know their zone, so it draws Zulu, and the browser
  // switches to the device's zone once mounted.
  const member = memberZone();
  // Chosen Zulu: every time in Zulu, alone.
  const shownZone = $derived(member.zulu ? "zulu" : zone);

  const start = $derived(new Date(value));
  const finish = $derived(end === undefined ? undefined : new Date(end));

  // A bad instant shows nothing rather than breaking the page.
  $effect(() => {
    if (!DEV) return;
    if (!isValid(start)) console.warn("Time: value is not a date:", value);
    if (finish && !isValid(finish))
      console.warn("Time: end is not a date:", end);
  });

  const pieces = $derived(
    timeText({
      start,
      end: finish,
      show,
      zone: shownZone,
      memberZone: member.zone,
      now,
    }),
  );
</script>

{#if pieces.length === 1}
  <time {...rest} datetime={pieces[0].at?.toISOString()} class={className}
    >{pieces[0].text}</time
  >
{:else if pieces.length > 1}
  <span {...rest} class={className}>
    {#each pieces as piece, i (i)}
      {#if piece.at}<time datetime={piece.at.toISOString()}>{piece.text}</time
        >{:else}{piece.text}{/if}
    {/each}
  </span>
{/if}
