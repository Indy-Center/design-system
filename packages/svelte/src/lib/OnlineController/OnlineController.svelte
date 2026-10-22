<script lang="ts" module>
  /** Someone logged in on the row's position, as the app's feed gives them. */
  export type OnlineMember = {
    /** The name as the app shows it; for a name-private member, the first name alone. */
    name: string;
    /** Their VATSIM CID. Shown only with `showCid`. */
    cid: number | string;
    /** When they logged in: a `Date`, an ISO string or milliseconds. */
    loggedInAt: Date | string | number;
    /** Their controller info, as text or VATSIM's lines: a `2330Z` in it is when they log out. */
    info?: string | readonly string[] | null;
    /** Their booking's end, which wins over the info. */
    bookingEnd?: Date | string | number;
    /** Where the name links to, such as their profile. */
    href?: string;
  };
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { logoffFromInfo } from "../aviation/logoff.js";
  import Member from "../Member/Member.svelte";
  import Position from "../Position/Position.svelte";
  import { isValid } from "../Time/format.js";
  import Time from "../Time/Time.svelte";

  type Props = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
    /** The callsign logged in, a relief login included: `IND_831_CTR`. */
    callsign: string;
    /** The vNAS position id, from the vNAS feed: matched instead of the callsign. */
    positionId?: string;
    /** Who is on the position: one, or two in a relief. */
    members: readonly OnlineMember[];
    /** Whether each name has its CID after it. Off by default. */
    showCid?: boolean;
  };

  let {
    callsign,
    positionId,
    members,
    showCid = false,
    class: className,
    ...rest
  }: Props = $props();

  /** When `member` logs out, if known: the booking's end, else the info's. */
  function logoffOf(member: OnlineMember): Date | undefined {
    if (member.bookingEnd !== undefined) {
      const end = new Date(member.bookingEnd);
      if (isValid(end)) return end;
    }
    return logoffFromInfo(member.info, member.loggedInAt);
  }
</script>

<div {...rest} class={className}>
  <Position {callsign} {positionId} />
  {#each members as member, i (i)}
    {@const logoff = logoffOf(member)}
    <div class="mt-1 text-sm">
      <span class="block text-foreground-soft"
        ><Member
          name={member.name}
          cid={member.cid}
          {showCid}
          href={member.href}
        /><span class="text-muted-foreground"
          >{" "}<span aria-hidden="true">·</span>{" "}<Time
            value={member.loggedInAt}
            show="relative"
          /></span
        ></span
      >
      {#if logoff}
        <span class="block text-muted-foreground"
          >Online until <Time value={logoff} zone="both" /></span
        >
      {/if}
    </div>
  {/each}
</div>
