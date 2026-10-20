<script lang="ts">
  // The "who's on" row composed from the recommended picks: position under
  // layout, plain frequency, member with CID, soft rating chip, compact
  // duration. The whole row is a disclosure button.
  import {
    NOW,
    RATINGS,
    durationShort,
    formatFrequency,
    isoDuration,
    localTime,
    resolvePosition,
    spokenFrequency,
    zulu,
  } from "./helpers.ts";

  let {
    login,
    name,
    cid,
    rating,
    loginTime,
    info,
    open = false,
  }: {
    login: string;
    name: string;
    cid: number;
    rating: string;
    loginTime: Date;
    info: string;
    open?: boolean;
  } = $props();

  const id = $props.id();
  // svelte-ignore state_referenced_locally
  let expanded = $state(open);
  const r = $derived(resolvePosition(login));
  const hz = $derived(r.kind === "unknown" ? undefined : r.position.frequency);
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
      <span class="flex items-baseline justify-between gap-2">
        <span class="font-mono font-semibold text-foreground">{login}</span>
        {#if hz}
          <span class="font-mono text-foreground tabular-nums"
            >{formatFrequency(hz)}<span class="sr-only">
              ({spokenFrequency(hz)})</span
            ></span
          >
        {/if}
      </span>
      <span class="block truncate text-sm text-muted-foreground">
        {#if r.kind === "unknown"}
          Not a ZID position
        {:else}
          {r.position.radioName} · {r.position.name}
        {/if}
      </span>
      <span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span class="text-foreground-soft"
          >{name}
          <span class="font-mono text-muted-foreground">{cid}</span></span
        >
        <abbr
          title={RATINGS[rating]}
          class="rounded-sm bg-muted px-1.5 font-mono text-xs font-semibold text-foreground no-underline"
          >{rating}</abbr
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
      <dt class="text-muted-foreground">Logged in</dt>
      <dd>
        <time datetime={loginTime.toISOString()}
          >{localTime(loginTime)} · {zulu(loginTime)}</time
        >
      </dd>
      {#if r.kind === "relief"}
        <dt class="text-muted-foreground">Relief of</dt>
        <dd class="font-mono">{r.position.callsign}</dd>
      {/if}
      {#if hz}
        <dt class="text-muted-foreground">Spoken</dt>
        <dd>“{spokenFrequency(hz)}”</dd>
      {/if}
    </dl>
    <p class="whitespace-pre-line text-foreground-soft">{info}</p>
  </div>
</li>
