<script lang="ts">
  // Throwaway prototype (ticket centerline-packages/08): the aviation
  // components' looks, side by side, so the user can pick one per point.
  // Positions come from a slim snapshot of ZID's vNAS Data Admin, read
  // 2026-10-20. Member names and CIDs are made up.
  import { Link } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
  import CopyFrequency from "./CopyFrequency.svelte";
  import OnlineRow from "./OnlineRow.svelte";
  import Variant from "./Variant.svelte";
  import {
    AIRPORTS,
    CATEGORIES,
    CATEGORY_NAMES,
    CREDENTIALS,
    NOW,
    RATINGS,
    durationClock,
    durationLong,
    durationShort,
    formatFrequency,
    isoDuration,
    localDate,
    localTime,
    resolvePosition,
    spokenFrequency,
    zulu,
    type Category,
    type CredentialKind,
    type Resolved,
  } from "./helpers.ts";

  const examples = ["IND_83_CTR", "IND_E_APP", "LEX_TWR"].map(resolvePosition);
  const relief = resolvePosition("IND_831_CTR");
  const unknown = resolvePosition("CMH_LCE");
  const freqs = [128_225_000, 121_900_000, 119_100_000];

  const members = [
    { name: "Alex Example", cid: 1000001 },
    {
      name: "Sam 1000002",
      cid: 1000002,
      note: "name-private: last name is the CID",
    },
  ];

  const start = new Date("2026-10-20T23:00:00Z");
  const end = new Date("2026-10-21T02:00:00Z");
  const loggedIn = new Date("2026-10-20T19:37:00Z");

  const hm = (d: Date, hour12 = true) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Indiana/Indianapolis",
      hour: "numeric",
      minute: "2-digit",
      hour12,
    }).format(d);

  const sub = "block text-sm text-muted-foreground";
  const cs = "font-mono font-semibold text-foreground";
  const h2 = "mt-10 mb-1 font-heading text-2xl font-semibold text-foreground";
  const lede = "mb-3 max-w-3xl text-sm";

  const kindTint: Record<CredentialKind, string> = {
    certification: "bg-success/15 text-success",
    endorsement: "bg-info/15 text-info",
    solo: "bg-warning/15 text-warning",
  };
  const kindLine: Record<CredentialKind, string> = {
    certification: "border-success text-success",
    endorsement: "border-info text-info",
    solo: "border-warning text-warning",
  };
  const kindWord: Record<CredentialKind, string> = {
    certification: "Cert",
    endorsement: "Endorsement",
    solo: "Solo",
  };
  const today: Record<CredentialKind, string> = {
    certification: "bg-emerald-600/80",
    endorsement: "bg-purple-600/80",
    solo: "bg-purple-600/80",
  };

  const catTint: Record<Category, string> = {
    VFR: "bg-success/15 text-success",
    MVFR: "bg-info/15 text-info",
    IFR: "bg-destructive/15 text-destructive",
    LIFR: "bg-destructive text-card",
  };
  const catLine: Record<Category, string> = {
    VFR: "border-success",
    MVFR: "border-info",
    IFR: "border-destructive",
    LIFR: "border-destructive border-double border-l-[6px]",
  };
  const catSolid: Record<Category, string> = {
    VFR: "bg-success text-card",
    MVFR: "bg-info text-card",
    IFR: "bg-destructive text-card",
    LIFR: "bg-destructive text-card ring-2 ring-destructive ring-offset-2 ring-offset-card",
  };
  const catToday: Record<Category, string> = {
    VFR: "border-green-300 text-green-300",
    MVFR: "border-blue-300 text-blue-300",
    IFR: "border-red-300 text-red-300",
    LIFR: "border-purple-300 text-purple-300",
  };
</script>

<svelte:head
  ><title>Aviation prototype · Centerline playground</title></svelte:head
>

{#snippet under(r: Resolved)}
  <span class="block">
    <span class={cs}>{r.login}</span>
    {#if r.kind !== "unknown"}
      <span class={sub}>{r.position.radioName} · {r.position.name}</span>
    {/if}
  </span>
{/snippet}

<h1 class="mb-2 font-heading text-3xl font-semibold text-foreground">
  Aviation prototype
</h1>
<p class={lede}>
  Throwaway. One look per point to pick; each set's recommendation has a blue
  border. Positions and frequencies are ZID's real Data Admin entries (snapshot
  of 2026-10-20); members are made up. Times are pinned to 21:00Z on Oct 20 and
  shown in Indianapolis time.
</p>

<!-- ───────────────────────── Position ───────────────────────── -->
<h2 class={h2}>1. Position: radio name beside or under</h2>
<p class={lede}>
  Callsign first. 29 ZID positions share the radio name "Indy Center", so the
  sector name ("Falmouth 83") is what tells them apart.
</p>
<Schemes>
  <Variant
    letter="A"
    note="Beside: callsign, radio name, sector name on one line; wraps when narrow."
  >
    {#each examples as r (r.login)}
      {#if r.kind !== "unknown"}
        <p>
          <span class={cs}>{r.login}</span>
          <span class="text-foreground-soft">{r.position.radioName}</span>
          <span class="text-sm text-muted-foreground">· {r.position.name}</span>
        </p>
      {/if}
    {/each}
  </Variant>
  <Variant
    letter="B"
    pick
    note="Under: callsign on its own line, radio name and sector beneath. Rows stay aligned."
  >
    {#each examples as r (r.login)}{@render under(r)}{/each}
  </Variant>
  <Variant
    letter="C"
    note="Beside, radio name only; sector name in a hover title (not on phones)."
  >
    {#each examples as r (r.login)}
      {#if r.kind !== "unknown"}
        <p title={r.position.name}>
          <span class={cs}>{r.login}</span>
          <span class="text-foreground-soft">{r.position.radioName}</span>
        </p>
      {/if}
    {/each}
  </Variant>
</Schemes>

<h2 class={h2}>2. Position: a relief login</h2>
<p class={lede}>
  <span class="font-mono">IND_831_CTR</span> resolves to
  <span class="font-mono">IND_83_CTR</span> by dropping the middle's last digit. Shown
  in layout B.
</p>
<Schemes>
  {#if relief.kind === "relief"}
    <Variant
      letter="A"
      pick
      note="The login, with the position's details and 'relief of' beneath."
    >
      <span class="block">
        <span class={cs}>{relief.login}</span>
        <span class={sub}
          >{relief.position.radioName} · {relief.position.name}</span
        >
        <span class={sub}
          >relief of <span class="font-mono">{relief.position.callsign}</span
          ></span
        >
      </span>
    </Variant>
    <Variant letter="B" note="The position; the login as a note beneath.">
      <span class="block">
        <span class={cs}>{relief.position.callsign}</span>
        <span class={sub}
          >{relief.position.radioName} · {relief.position.name}</span
        >
        <span class={sub}
          >logged in as <span class="font-mono">{relief.login}</span></span
        >
      </span>
    </Variant>
    <Variant letter="C" note="Both on the first line, login → position.">
      <span class="block">
        <span class={cs}>{relief.login}</span>
        <span class="font-mono text-muted-foreground" aria-label="relief of"
          >→</span
        >
        <span class="font-mono text-foreground-soft"
          >{relief.position.callsign}</span
        >
        <span class={sub}
          >{relief.position.radioName} · {relief.position.name}</span
        >
      </span>
    </Variant>
    <Variant
      letter="D"
      note="The login only, details filled in; nothing says it is a relief."
    >
      {@render under(relief)}
    </Variant>
  {/if}
</Schemes>

<h2 class={h2}>3. Position: an unknown callsign</h2>
<p class={lede}>
  <span class="font-mono">CMH_LCE</span> (typed in a feedback form) matches no ZID
  position, so there's no radio name or frequency.
</p>
<Schemes>
  <Variant
    letter="A"
    pick
    note="The callsign alone, as component-list's rule says."
  >
    {@render under(unknown)}
  </Variant>
  <Variant
    letter="B"
    note="The callsign, and a muted line saying so (keeps a row's height)."
  >
    <span class="block">
      <span class={cs}>{unknown.login}</span>
      <span class={sub}>Not a ZID position</span>
    </span>
  </Variant>
  <Variant
    letter="C"
    note="Muted callsign with a dotted underline and a hover title."
  >
    <span
      class="font-mono font-semibold text-muted-foreground underline decoration-dotted underline-offset-4"
      title="Not a ZID position">{unknown.login}</span
    >
  </Variant>
</Schemes>

<!-- ───────────────────────── Frequency ───────────────────────── -->
<h2 class={h2}>4. Frequency</h2>
<p class={lede}>
  Mono, three decimals. Each carries the 7110.65 spoken form for screen readers
  ("one two eight point two two": digits after the second decimal dropped, nine
  is "niner").
</p>
<Schemes>
  <Variant
    letter="A"
    pick
    note="Digits only; spoken form hidden for screen readers."
  >
    {#each freqs as hz (hz)}
      <p>
        <span class="font-mono text-foreground tabular-nums"
          >{formatFrequency(hz)}<span class="sr-only">
            ({spokenFrequency(hz)})</span
          ></span
        >
      </p>
    {/each}
  </Variant>
  <Variant letter="B" note="With a muted 'MHz'.">
    {#each freqs as hz (hz)}
      <p>
        <span class="font-mono text-foreground tabular-nums"
          >{formatFrequency(hz)}</span
        >
        <span class="text-sm text-muted-foreground">MHz</span>
      </p>
    {/each}
  </Variant>
  <Variant
    letter="C"
    note="With a copy button (44px target, 'Copied' announced)."
  >
    {#each freqs as hz (hz)}<p><CopyFrequency {hz} /></p>{/each}
  </Variant>
  <Variant letter="D" note="Spoken form visible after it, for procedures only.">
    {#each freqs as hz (hz)}
      <p>
        <span class="font-mono text-foreground tabular-nums"
          >{formatFrequency(hz)}</span
        >
        <span class="text-sm text-muted-foreground"
          >“{spokenFrequency(hz)}”</span
        >
      </p>
    {/each}
  </Variant>
</Schemes>

<!-- ───────────────────────── Member ───────────────────────── -->
<h2 class={h2}>5. Member: one CID format</h2>
<p class={lede}>
  Replaces today's five: <code>Name (1234567)</code>, <code>CID 1234567</code>,
  <code>CID: 1234567</code>, bare CID beside the name, and
  <code>1234567 · S2 · …</code>. The second member is name-private: CW shows the
  CID for the last name, so every format here prints the CID twice. That rule
  wants deciding with this one.
</p>
<Schemes>
  <Variant
    letter="A"
    pick
    note="Name, then the CID in muted mono. Name links when there's a profile."
  >
    {#each members as m (m.cid)}
      <p>
        {#if m.cid === 1000001}<Link href="#member">{m.name}</Link
          >{:else}{m.name}{/if}
        <span class="font-mono text-sm text-muted-foreground">{m.cid}</span>
      </p>
    {/each}
  </Variant>
  <Variant letter="B" note="Name (CID), as the roster does.">
    {#each members as m (m.cid)}
      <p>
        {m.name}
        <span class="font-mono text-sm text-muted-foreground">({m.cid})</span>
      </p>
    {/each}
  </Variant>
  <Variant letter="C" note="Stacked: name over 'CID 1000001'.">
    {#each members as m (m.cid)}
      <p>
        <span class="block text-foreground">{m.name}</span>
        <span class="block font-mono text-xs text-muted-foreground"
          >CID {m.cid}</span
        >
      </p>
    {/each}
  </Variant>
  <Variant letter="D" note="Name · CID, labelled.">
    {#each members as m (m.cid)}
      <p>
        {m.name}
        <span class="text-sm text-muted-foreground"
          >· CID <span class="font-mono">{m.cid}</span></span
        >
      </p>
    {/each}
  </Variant>
</Schemes>

<!-- ───────────────────────── Airport ───────────────────────── -->
<h2 class={h2}>6. Airport</h2>
<Schemes>
  <Variant
    letter="A"
    note="Code in <abbr>, name in a hover tooltip (no tooltip by touch or keyboard)."
  >
    <p class="flex gap-3">
      {#each AIRPORTS as a (a.icao)}
        <abbr
          title={a.name}
          class="font-mono font-semibold text-foreground decoration-dotted"
          >{a.icao}</abbr
        >
      {/each}
    </p>
  </Variant>
  <Variant letter="B" pick note="Code and name inline, name muted.">
    {#each AIRPORTS as a (a.icao)}
      <p>
        <span class="font-mono font-semibold text-foreground">{a.icao}</span>
        <span class="text-sm text-muted-foreground">{a.name}</span>
      </p>
    {/each}
  </Variant>
  <Variant letter="C" note="Stacked: code over name, for cards.">
    {#each AIRPORTS as a (a.icao)}
      <p>
        <span class="block font-mono font-semibold text-foreground"
          >{a.icao}</span
        >
        <span class="block text-sm text-muted-foreground">{a.name}</span>
      </p>
    {/each}
  </Variant>
</Schemes>

<!-- ───────────────────────── Time ───────────────────────── -->
<h2 class={h2}>7. Time: local with Zulu</h2>
<p class={lede}>
  Each is a <code>&lt;time datetime&gt;</code>. Single time, then an event range
  that crosses Zulu midnight.
</p>
<Schemes>
  <Variant
    letter="A"
    pick
    note="Local first, Zulu after a dot: 7:00 PM EDT · 2300Z."
  >
    <p>
      <time datetime={start.toISOString()}
        >{localTime(start)} · {zulu(start)}</time
      >
    </p>
    <p>
      {localDate(start)},
      <time datetime={start.toISOString()}>{hm(start)}</time>–<time
        datetime={end.toISOString()}>{localTime(end)}</time
      >
      <span class="text-muted-foreground">· {zulu(start)}–{zulu(end)}</span>
    </p>
  </Variant>
  <Variant
    letter="B"
    note="Zulu first, local in brackets: 2300Z (7:00 PM EDT)."
  >
    <p>
      <time datetime={start.toISOString()}
        >{zulu(start)}
        <span class="text-muted-foreground">({localTime(start)})</span></time
      >
    </p>
    <p>
      {zulu(start)}–{zulu(end)}
      <span class="text-muted-foreground"
        >({localDate(start)}, {hm(start)}–{localTime(end)})</span
      >
    </p>
  </Variant>
  <Variant letter="C" note="Two lines: local, then Zulu muted beneath.">
    <p>
      <time datetime={start.toISOString()} class="block"
        >{localTime(start)}</time
      >
      <span class="block text-sm text-muted-foreground">{zulu(start)}</span>
    </p>
    <p>
      <span class="block">{localDate(start)}, {hm(start)}–{localTime(end)}</span
      >
      <span class="block text-sm text-muted-foreground"
        >{zulu(start)}–{zulu(end)}</span
      >
    </p>
  </Variant>
  <Variant letter="D" note="24-hour both: 19:00 EDT · 23:00Z.">
    <p>
      <time datetime={start.toISOString()}
        >{localTime(start, false)} · {zulu(start, true)}</time
      >
    </p>
    <p>
      {localDate(start)}, {hm(start, false)}–{localTime(end, false)}
      <span class="text-muted-foreground"
        >· {zulu(start, true)}–{zulu(end, true)}</span
      >
    </p>
  </Variant>
</Schemes>

<h2 class={h2}>8. Time: relative</h2>
<p class={lede}>
  An event starting at 2300Z, and a controller online since 1937Z.
</p>
<Schemes>
  <Variant letter="A" pick note="Short units: in 2 h, online 1 h 23 m.">
    <p>
      Starts <time
        datetime={start.toISOString()}
        title="{localTime(start)} · {zulu(start)}"
        >in {durationShort(NOW, start)}</time
      >
    </p>
    <p>
      Online <time datetime={isoDuration(loggedIn, NOW)}
        >{durationShort(loggedIn, NOW)}</time
      >
    </p>
  </Variant>
  <Variant letter="B" note="Words: in 2 hours, online for 1 hour 23 minutes.">
    <p>
      Starts <time datetime={start.toISOString()}
        >in {durationLong(NOW, start)}</time
      >
    </p>
    <p>
      Online for <time datetime={isoDuration(loggedIn, NOW)}
        >{durationLong(loggedIn, NOW)}</time
      >
    </p>
  </Variant>
  <Variant letter="C" note="Clock: in 2:00, online 1:23 (VATUSA's HH:MM).">
    <p>
      Starts in <time datetime={start.toISOString()} class="font-mono"
        >{durationClock(NOW, start)}</time
      >
    </p>
    <p>
      Online <time datetime={isoDuration(loggedIn, NOW)} class="font-mono"
        >{durationClock(loggedIn, NOW)}</time
      >
    </p>
  </Variant>
</Schemes>

<!-- ───────────────────────── Rating ───────────────────────── -->
<h2 class={h2}>9. Rating</h2>
<p class={lede}>
  Long name in <code>&lt;abbr title&gt;</code>. Today's look uses stock colours,
  for comparison only.
</p>
<Schemes>
  <Variant
    letter="T"
    today
    note="CW roster chip (sky-600/90) and header chip (sky-600/30)."
  >
    <p class="flex flex-wrap gap-2">
      {#each ["S2", "C1", "I1"] as r (r)}
        <span
          class="rounded-md bg-sky-600/90 px-2 py-0.5 text-xs font-semibold text-white"
          >{r}</span
        >
      {/each}
      <span
        class="rounded-md bg-sky-600/30 px-2 py-1 text-xs font-semibold text-sky-200"
        >C1</span
      >
    </p>
  </Variant>
  <Variant letter="A" note="Solid primary chip.">
    <p class="flex flex-wrap gap-2">
      {#each ["S2", "C1", "I1"] as r (r)}
        <abbr
          title={RATINGS[r]}
          class="rounded-sm bg-primary px-1.5 font-mono text-xs font-semibold text-primary-foreground no-underline"
          >{r}</abbr
        >
      {/each}
    </p>
  </Variant>
  <Variant
    letter="B"
    pick
    note="Soft neutral chip (muted fill); leaves blue for links and buttons."
  >
    <p class="flex flex-wrap gap-2">
      {#each ["S2", "C1", "I1"] as r (r)}
        <abbr
          title={RATINGS[r]}
          class="rounded-sm bg-muted px-1.5 font-mono text-xs font-semibold text-foreground no-underline"
          >{r}</abbr
        >
      {/each}
    </p>
  </Variant>
  <Variant letter="C" note="Outlined, no fill.">
    <p class="flex flex-wrap gap-2">
      {#each ["S2", "C1", "I1"] as r (r)}
        <abbr
          title={RATINGS[r]}
          class="rounded-sm border border-border px-1.5 font-mono text-xs font-semibold text-foreground-soft no-underline"
          >{r}</abbr
        >
      {/each}
    </p>
  </Variant>
</Schemes>

<!-- ───────────────────────── Credential ───────────────────────── -->
<h2 class={h2}>10. Credential</h2>
<p class={lede}>
  Certification, endorsement, solo. Colour is never the only signal: the code
  and (for solo) the expiry are text.
</p>
<Schemes>
  <Variant
    letter="T"
    today
    note="CW roster: emerald certifications, purple endorsements and solos."
  >
    <p class="flex flex-wrap gap-2">
      {#each CREDENTIALS as c (c.code)}
        <span
          class={[
            "rounded-md px-2 py-0.5 text-xs font-semibold text-white",
            today[c.kind],
          ]}>{c.code}</span
        >
      {/each}
    </p>
  </Variant>
  <Variant
    letter="A"
    pick
    note="Tinted per kind: success, info, warning; solo shows its expiry."
  >
    <p class="flex flex-wrap gap-2">
      {#each CREDENTIALS as c (c.code)}
        <abbr
          title={c.name}
          class={[
            "rounded-sm px-1.5 font-mono text-xs font-semibold no-underline",
            kindTint[c.kind],
          ]}
          >{c.code}{#if c.kind === "solo"}<span class="font-sans font-normal"
              >&nbsp;· until Nov 3</span
            >{/if}</abbr
        >
      {/each}
    </p>
  </Variant>
  <Variant letter="B" note="Neutral chip, kind as a word.">
    <p class="flex flex-wrap gap-2">
      {#each CREDENTIALS as c (c.code)}
        <abbr
          title={c.name}
          class="rounded-sm bg-muted px-1.5 text-xs text-foreground no-underline"
          ><span class="text-muted-foreground">{kindWord[c.kind]}</span>
          <span class="font-mono font-semibold">{c.code}</span></abbr
        >
      {/each}
    </p>
  </Variant>
  <Variant letter="C" note="Outlined in the kind's colour.">
    <p class="flex flex-wrap gap-2">
      {#each CREDENTIALS as c (c.code)}
        <abbr
          title={c.name}
          class={[
            "rounded-sm border px-1.5 font-mono text-xs font-semibold no-underline",
            kindLine[c.kind],
          ]}>{c.code}</abbr
        >
      {/each}
    </p>
  </Variant>
</Schemes>

<!-- ───────────────────────── FlightCategory ───────────────────────── -->
<h2 class={h2}>11. Flight category</h2>
<p class={lede}>
  FAA colours are green, blue, red, magenta. There's no magenta role, so LIFR is
  told from IFR by weight (filled, double line, ring), not hue.
</p>
<Schemes>
  <Variant
    letter="T"
    today
    note="CW WeatherRow: -300 text with a 3px left border."
  >
    <p class="flex flex-wrap gap-3">
      {#each CATEGORIES as c (c)}
        <span class={["border-l-3 pl-1.5 text-xs font-semibold", catToday[c]]}
          >{c}</span
        >
      {/each}
    </p>
  </Variant>
  <Variant letter="A" pick note="Tinted badge; LIFR filled.">
    <p class="flex flex-wrap gap-2">
      {#each CATEGORIES as c (c)}
        <abbr
          title={CATEGORY_NAMES[c]}
          class={[
            "rounded-sm px-1.5 text-xs font-semibold no-underline",
            catTint[c],
          ]}>{c}</abbr
        >
      {/each}
    </p>
  </Variant>
  <Variant
    letter="B"
    note="Today's left-border tag, on roles; LIFR a double line."
  >
    <p class="flex flex-wrap gap-3">
      {#each CATEGORIES as c (c)}
        <abbr
          title={CATEGORY_NAMES[c]}
          class={[
            "border-l-3 pl-1.5 text-xs font-semibold text-foreground no-underline",
            catLine[c],
          ]}>{c}</abbr
        >
      {/each}
    </p>
  </Variant>
  <Variant letter="C" note="Solid fill; LIFR ringed.">
    <p class="flex flex-wrap gap-3">
      {#each CATEGORIES as c (c)}
        <abbr
          title={CATEGORY_NAMES[c]}
          class={[
            "rounded-sm px-1.5 text-xs font-semibold no-underline",
            catSolid[c],
          ]}>{c}</abbr
        >
      {/each}
    </p>
  </Variant>
</Schemes>

<!-- ───────────────────────── OnlineController ───────────────────────── -->
<h2 class={h2}>12. OnlineController</h2>
<p class={lede}>
  Built from the recommended picks (1B, 4A, 5A, 7A, 8A, 9B). Two changes for a
  row: the relief note (2A) moves into the open part, and the unknown callsign
  gets 3B's line so rows keep one height. The whole row is a
  <code>&lt;button aria-expanded&gt;</code>; the first row starts open. Tap to
  toggle.
</p>
<Schemes>
  <ul
    class="max-w-[390px] overflow-hidden rounded-md border border-border bg-background"
  >
    <OnlineRow
      login="IND_831_CTR"
      name="Alex Example"
      cid={1000001}
      rating="C1"
      loginTime={loggedIn}
      info={"Indy Center, Falmouth sector.\nExpected log-off time: 2330z"}
      open
    />
    <OnlineRow
      login="LEX_TWR"
      name="Sam 1000002"
      cid={1000002}
      rating="S2"
      loginTime={new Date("2026-10-20T20:12:00Z")}
      info="Lexington Tower. Feedback: flyindycenter.com/feedback"
    />
    <OnlineRow
      login="CMH_LCE"
      name="Pat Placeholder"
      cid={1000003}
      rating="S3"
      loginTime={new Date("2026-10-20T20:51:00Z")}
      info="Training session."
    />
  </ul>
</Schemes>
<div class="h-16"></div>
