<script lang="ts">
  // Round 5's "who's on" row, flat (no disclosure): the Position (C2), the
  // member (CID optional, off by default) and how long they've been on (8A),
  // then when they log out. The log-out time comes from a booking when there
  // is one, else from a "2330z" in the controller info.
  import Member from "./Member.svelte";
  import Position, { type Field } from "./Position.svelte";
  import {
    NOW,
    durationShort,
    isoDuration,
    localTime,
    parseLogoff,
    zulu,
  } from "./helpers.ts";

  let {
    login,
    member,
    loginTime,
    info = "",
    bookingEnd,
    show,
    layout = "stacked",
    showCid = false,
  }: {
    login: string;
    member: { first: string; last: string; cid: number; hidden?: boolean };
    loginTime: Date;
    info?: string;
    bookingEnd?: Date;
    show: Field[];
    layout?: "inline" | "stacked";
    showCid?: boolean;
  } = $props();

  const logoff = $derived(bookingEnd ?? parseLogoff(info, loginTime));
</script>

<li class="border-b border-border px-3 py-2.5 last:border-b-0">
  <Position {login} {show} {layout} />
  <span class="mt-1 block text-sm">
    <span class="text-foreground-soft"><Member {...member} {showCid} /></span>
    <span class="text-muted-foreground">
      · <time datetime={isoDuration(loginTime, NOW)}
        >{durationShort(loginTime, NOW)}</time
      ></span
    >
  </span>
  {#if logoff}
    <span class="block text-sm text-muted-foreground"
      >Online until <time datetime={logoff.toISOString()}
        >{localTime(logoff)} · {zulu(logoff)}</time
      ></span
    >
  {/if}
</li>
