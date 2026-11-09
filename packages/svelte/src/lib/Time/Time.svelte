<script lang="ts">
  import { DEV } from "esm-env";
  import type { HTMLAttributes } from "svelte/elements";
  import {
    dailyText,
    isTimeOfDay,
    isValid,
    timeText,
    type Piece,
    type TimeShown,
    type TimeZoneShown,
  } from "./format.js";
  import { memberZone } from "../timeZone/memberZone.svelte.js";
  import { now } from "./now.svelte.js";

  type When = Date | string | number;
  // The root is a <time>, or a <span> around a range's <time>s, so only the
  // attributes both take; `Time` sets `datetime` itself.
  type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    /** The instant: a `Date`, an ISO string or milliseconds since the epoch. With `show="daily"`, a Zulu time of day: `"2300"`. */
    value: When;
    /** A range's end, for `7:00 PM–10:00 PM EDT`. With `show="daily"`, `"0300"`. */
    end?: When;
    /** `"local"` (the default), `"zulu"`, or `"both"`: local, then Zulu. Ignored by `show="daily"`. */
    zone?: TimeZoneShown;
    /** `"time"` (the default), `"datetime"` (day first), `"relative"` ("in 2 h") or `"daily"` (a Zulu time of day, `2300Z`). */
    show?: TimeShown | "daily";
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

  const daily = $derived(show === "daily");

  // A bad instant shows nothing rather than breaking the page.
  $effect(() => {
    if (!DEV) return;
    if (daily) {
      if (!isTimeOfDay(value))
        console.warn("Time: value is not a time of day:", value);
      else if (end !== undefined && !isTimeOfDay(end))
        console.warn("Time: end is not a time of day:", end);
      return;
    }
    if (!isValid(start)) console.warn("Time: value is not a date:", value);
    if (finish && !isValid(finish))
      console.warn("Time: end is not a date:", end);
  });

  const pieces = $derived(
    show === "daily"
      ? dailyText(String(value), end === undefined ? undefined : String(end))
      : timeText({
          start,
          end: finish,
          show,
          zone: shownZone,
          memberZone: member.zone,
          now,
        }),
  );
  const datetimeOf = (piece: Piece) =>
    piece.datetime ?? piece.at?.toISOString();
</script>

{#if pieces.length === 1}
  <time {...rest} datetime={datetimeOf(pieces[0])} class={className}
    >{pieces[0].text}</time
  >
{:else if pieces.length > 1}
  <span {...rest} class={className}>
    {#each pieces as piece, i (i)}
      {#if datetimeOf(piece)}<time datetime={datetimeOf(piece)}
          >{piece.text}</time
        >{:else}{piece.text}{/if}
    {/each}
  </span>
{/if}
