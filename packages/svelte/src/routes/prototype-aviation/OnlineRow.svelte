<script lang="ts">
  // Round 2's "who's on" row: the Position with the page's chosen fields, the
  // member in the page's chosen format, how long they've been on (8A). No
  // rating. The whole row is a disclosure button; the open part holds the
  // login, relief note, log-in time (7A) and spoken frequency.
  import Member, { type MemberFormat, type Privacy } from "./Member.svelte";
  import Position, { type Field } from "./Position.svelte";
  import {
    NOW,
    durationShort,
    isoDuration,
    localTime,
    resolvePosition,
    spokenFrequency,
    zulu,
  } from "./helpers.ts";

  let {
    login,
    member,
    loginTime,
    info,
    show,
    format,
    privacy,
    open = false,
  }: {
    login: string;
    member: { first: string; last: string; cid: number; hidden?: boolean };
    loginTime: Date;
    info: string;
    show: Field[];
    format: MemberFormat;
    privacy: Privacy;
    open?: boolean;
  } = $props();

  const id = $props.id();
  // svelte-ignore state_referenced_locally
  let expanded = $state(open);
  const r = $derived(resolvePosition(login));
</script>

<li class="border-b border-border last:border-b-0">
  <button
    type="button"
    aria-expanded={expanded}
    aria-controls="{id}-more"
    onclick={() => (expanded = !expanded)}
    class="flex min-h-11 w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
  >
    <span class="min-w-0 flex-1">
      <Position {login} {show} />
      <span class="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
        <span class="text-foreground-soft"
          ><Member {...member} {format} {privacy} /></span
        >
        <span class="text-muted-foreground"
          >online <time datetime={isoDuration(loginTime, NOW)}
            >{durationShort(loginTime, NOW)}</time
          ></span
        >
      </span>
    </span>
    <svg
      viewBox="0 0 20 20"
      class={[
        "mt-1 size-4 shrink-0 text-muted-foreground transition-transform",
        expanded && "rotate-180",
      ]}
      fill="currentColor"
      aria-hidden="true"
      ><path
        fill-rule="evenodd"
        d="M5.2 7.2a1 1 0 0 1 1.4 0L10 10.6l3.4-3.4a1 1 0 1 1 1.4 1.4l-4.1 4.1a1 1 0 0 1-1.4 0L5.2 8.6a1 1 0 0 1 0-1.4Z"
      /></svg
    >
  </button>
  <div
    id="{id}-more"
    hidden={!expanded}
    class="space-y-2 bg-card px-3 pt-1 pb-3 text-sm"
  >
    <dl class="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
      <dt class="text-muted-foreground">Callsign</dt>
      <dd class="font-mono">{login}</dd>
      {#if r.kind === "relief"}
        <dt class="text-muted-foreground">Relief of</dt>
        <dd class="font-mono">{r.position.callsign}</dd>
      {/if}
      <dt class="text-muted-foreground">Logged in</dt>
      <dd>
        <time datetime={loginTime.toISOString()}
          >{localTime(loginTime)} · {zulu(loginTime)}</time
        >
      </dd>
      {#if r.kind !== "unknown"}
        <dt class="text-muted-foreground">Spoken</dt>
        <dd>“{spokenFrequency(r.position.frequency)}”</dd>
      {/if}
    </dl>
    <p class="whitespace-pre-line text-foreground-soft">{info}</p>
  </div>
</li>
