<script lang="ts">
  // Throwaway prototype (ticket centerline-packages/08), round 4. Earlier
  // rounds are in this branch's history (221dbef, 7499bb3, d3f050d). Settled
  // picks at the top; open: the Position's presets (controllers and pilots)
  // and one position held by two people. Positions come from a slim snapshot of
  // ZID's vNAS Data Admin, read 2026-10-20. Members are made up.
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Schemes from "../../playground/Schemes.svelte";
  import Member from "./Member.svelte";
  import OnlineRow from "./OnlineRow.svelte";
  import Pair from "./Pair.svelte";
  import Position, { FIELDS, type Field } from "./Position.svelte";
  import Variant from "./Variant.svelte";
  import {
    AIRPORTS,
    CATEGORIES,
    CATEGORY_NAMES,
    CREDENTIALS,
    NOW,
    RATINGS,
    airportOf,
    durationShort,
    formatDate,
    formatFrequency,
    localTime,
    resolvePosition,
    spokenFrequency,
    zulu,
    type Category,
    type CredentialKind,
    type DateStyle,
  } from "./helpers.ts";

  // ── Page state, mirrored in the URL so a set-up can be shared ──
  const q = page.url.searchParams;
  const allFields = FIELDS.map((f) => f.key);
  const fromQuery = (q.get("fields") ?? "")
    .split(",")
    .filter((f): f is Field => allFields.includes(f as Field));
  let fields = $state<Field[]>(
    fromQuery.length
      ? fromQuery
      : ["callsign", "radioName", "name", "frequency"],
  );
  let layout = $state<"inline" | "stacked">(
    q.get("layout") === "inline" ? "inline" : "stacked",
  );
  let airportAt = $state<"left" | "under">(
    q.get("airport") === "under" ? "under" : "left",
  );
  let decimals = $state<2 | 3>(q.get("decimals") === "3" ? 3 : 2);

  $effect(() => {
    const u = new URL(page.url.href);
    u.searchParams.set("fields", fields.join(","));
    u.searchParams.set("layout", layout);
    u.searchParams.set("airport", airportAt);
    u.searchParams.set("decimals", String(decimals));
    if (u.search !== page.url.search)
      goto(u, { state: {}, shallow: true, replace: true, reset: false });
  });

  function toggle(f: Field) {
    if (fields.includes(f)) {
      if (fields.length > 1) fields = fields.filter((x) => x !== f);
    } else fields = allFields.filter((x) => x === f || fields.includes(x));
  }

  const controllerRows = [
    "IND_83_CTR",
    "IND_E_APP",
    "LEX_TWR",
    "IND_831_CTR",
    "CMH_LCE",
  ];
  const pilotRows = [
    "IND_83_CTR",
    "IND_E_APP",
    "IND_E_TWR",
    "IND_GND",
    "LEX_TWR",
    "LEX_GND",
  ];

  type Preset = {
    letter: string;
    note: string;
    show: Field[];
    layout?: "inline" | "stacked";
    airportAt?: "left" | "under";
    pick?: boolean;
  };
  const controllerPresets: Preset[] = [
    {
      letter: "C1",
      note: "Radio name, sector beneath, frequency right.",
      show: ["radioName", "name", "frequency"],
    },
    {
      letter: "C2",
      pick: true,
      note: "C1 with the short name first on the second line (the callsign until vNAS publishes it).",
      show: ["callsign", "radioName", "name", "frequency"],
    },
    {
      letter: "C3",
      note: "C2 on one line, for tight spots.",
      show: ["callsign", "radioName", "name", "frequency"],
      layout: "inline",
    },
    {
      letter: "C4",
      note: "No radio name: the sector leads, the short name beneath.",
      show: ["callsign", "name", "frequency"],
    },
    {
      letter: "C5",
      note: "No radio name or short name: sector and frequency.",
      show: ["name", "frequency"],
    },
    {
      letter: "C6",
      note: "C4 on one line.",
      show: ["callsign", "name", "frequency"],
      layout: "inline",
    },
  ];
  const pilotPresets: Preset[] = [
    {
      letter: "P1",
      note: "Radio name and frequency: what a pilot tunes and calls.",
      show: ["radioName", "frequency"],
    },
    {
      letter: "P2",
      pick: true,
      note: "P1, the airport on the left. An approach shows its primary airport; a center has none.",
      show: ["airport", "radioName", "frequency"],
    },
    {
      letter: "P3",
      note: "P1, the airport and its name beneath.",
      show: ["airport", "radioName", "frequency"],
      airportAt: "under",
    },
  ];

  // P4: a pilot list grouped by airport, composed on the page.
  const groups = $derived.by(() => {
    const out = new Map<string, { title: string; logins: string[] }>();
    for (const l of pilotRows) {
      const a = airportOf(l);
      const key = a?.icao ?? "enroute";
      const title = a ? `${a.icao} ${a.name}` : "Enroute";
      if (!out.has(key)) out.set(key, { title, logins: [] });
      out.get(key)!.logins.push(l);
    }
    return [...out.values()];
  });

  // Relief: two people on what resolves to the same position.
  const alex = { first: "Alex", last: "Example", cid: 1000001 };
  const sam = { first: "Sam", last: "Private", cid: 1000002, hidden: true };
  const jordan = { first: "Jordan", last: "Sample", cid: 1000004 };
  const online = [
    { login: "IND_83_CTR", member: alex },
    { login: "IND_831_CTR", member: jordan },
    { login: "LEX_TWR", member: sam },
  ];
  // One entry per position, with everyone on it.
  const byPosition = $derived.by(() => {
    const out = new Map<
      string,
      { login: string; members: (typeof online)[number]["member"][] }
    >();
    for (const o of online) {
      const r = resolvePosition(o.login);
      const key = r.kind === "unknown" ? o.login : r.position.callsign;
      if (!out.has(key)) out.set(key, { login: key, members: [] });
      out.get(key)!.members.push(o.member);
    }
    return [...out.values()];
  });

  const events = [
    {
      name: "Fall Fly-In",
      start: "2026-10-20T23:00:00Z",
      end: "2026-10-21T02:00:00Z",
    },
    {
      name: "Wednesday Night Ops",
      start: "2026-10-22T00:00:00Z",
      end: "2026-10-22T02:00:00Z",
    },
    {
      name: "Tuesday Tune-Up",
      start: "2026-10-27T23:30:00Z",
      end: "2026-10-28T01:30:00Z",
    },
    {
      name: "Spring Into Indy",
      start: "2027-03-05T00:00:00Z",
      end: "2027-03-05T03:00:00Z",
    },
  ].map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));

  const loggedIn = new Date("2026-10-20T19:37:00Z");

  const hm = (d: Date) =>
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Indiana/Indianapolis",
      hour: "numeric",
      minute: "2-digit",
    }).format(d);

  const h2 = "mt-10 mb-1 font-heading text-2xl font-semibold text-foreground";
  const h3 = "mt-6 mb-2 font-heading text-lg font-semibold text-foreground";
  const lede = "mb-3 max-w-3xl text-sm";
  const seg =
    "min-h-11 rounded-md border border-border px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring flex items-center gap-2 cursor-pointer";

  const kindTint: Record<CredentialKind, string> = {
    certification: "bg-success/15 text-success",
    endorsement: "bg-info/15 text-info",
    solo: "bg-warning/15 text-warning",
  };
  const catTint: Record<Category, string> = {
    VFR: "bg-success/15 text-success",
    MVFR: "bg-info/15 text-info",
    IFR: "bg-destructive/15 text-destructive",
    LIFR: "bg-destructive text-card",
  };
  const showProp = (p: Preset) =>
    `show={[${p.show.map((f) => `"${f}"`).join(", ")}]}` +
    (p.layout === "inline" ? ' layout="inline"' : "") +
    (p.airportAt === "under" ? ' airportAt="under"' : "");
</script>

<svelte:head
  ><title>Aviation prototype, round 4 · Centerline playground</title
  ></svelte:head
>

{#snippet range(e: (typeof events)[number], style: DateStyle)}
  <time datetime={e.start.toISOString()}
    >{formatDate(e.start, style)}, {hm(e.start)}</time
  >–<time datetime={e.end.toISOString()}>{localTime(e.end)}</time>
  <span class="whitespace-nowrap text-muted-foreground"
    >· {zulu(e.start)}–{zulu(e.end)}</span
  >
{/snippet}

{#snippet presetCard(p: Preset, rows: string[])}
  <Variant letter={p.letter} pick={p.pick} note={p.note}>
    <ul class="space-y-2">
      {#each rows as login (login)}
        <li>
          <Position
            {login}
            show={p.show}
            layout={p.layout}
            airportAt={p.airportAt}
            {decimals}
          />
        </li>
      {/each}
    </ul>
    <code class="block text-xs text-muted-foreground">{showProp(p)}</code>
  </Variant>
{/snippet}

<h1 class="mb-2 font-heading text-3xl font-semibold text-foreground">
  Aviation prototype, round 4
</h1>
<p class={lede}>
  Throwaway. Rounds 1 to 3 are settled below; the rest is your feedback, built
  out. Positions and frequencies are ZID's real Data Admin entries; members are
  made up. Clock pinned to 21:00Z, Oct 20, shown in Indianapolis time. The
  switches are kept in the URL, so a set-up can be shared.
</p>

<!-- ───────────────────────── Settled ───────────────────────── -->
<h2 class={h2}>Settled</h2>
<Schemes>
  <dl class="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-2 text-sm">
    <dt class="text-muted-foreground">Time</dt>
    <dd>
      <time datetime="2026-10-20T23:00:00Z"
        >{localTime(events[0].start)} · {zulu(events[0].start)}</time
      >
    </dd>
    <dt class="text-muted-foreground">Date</dt>
    <dd>
      {#each events as e (e.name)}<span class="block"
          >{@render range(e, "D")}</span
        >{/each}
    </dd>
    <dt class="text-muted-foreground">Relative</dt>
    <dd>
      in {durationShort(NOW, events[0].start)} · online {durationShort(
        loggedIn,
        NOW,
      )}
    </dd>
    <dt class="text-muted-foreground">Rating</dt>
    <dd class="flex flex-wrap gap-2">
      {#each ["S2", "C1", "I1"] as r (r)}
        <abbr
          title={RATINGS[r]}
          class="rounded-sm bg-muted px-1.5 font-mono text-xs font-semibold text-foreground no-underline"
          >{r}</abbr
        >
      {/each}
      <span class="text-xs text-muted-foreground">opt-in</span>
    </dd>
    <dt class="text-muted-foreground">Credential</dt>
    <dd class="flex flex-wrap gap-2">
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
    </dd>
    <dt class="text-muted-foreground">Category</dt>
    <dd class="flex flex-wrap gap-2">
      {#each CATEGORIES as c (c)}
        <abbr
          title={CATEGORY_NAMES[c]}
          class={[
            "rounded-sm px-1.5 text-xs font-semibold no-underline",
            catTint[c],
          ]}>{c}</abbr
        >
      {/each}
      <span class="text-xs text-muted-foreground">LIFR magenta: ticket 49</span>
    </dd>
    <dt class="text-muted-foreground">Airport</dt>
    <dd>
      <span class="font-mono font-semibold text-foreground">KIND</span>
      <span class="text-sm text-muted-foreground">{AIRPORTS[0].name}</span>
      <span class="block text-xs text-muted-foreground"
        >or the code alone, name in a tooltip</span
      >
    </dd>
    <dt class="text-muted-foreground">Frequency</dt>
    <dd>
      <span class="font-mono text-foreground tabular-nums"
        >{formatFrequency(128_225_000)}<span class="sr-only">
          ({spokenFrequency(128_225_000)})</span
        ></span
      >
      <span class="font-mono text-foreground tabular-nums"
        >{formatFrequency(121_900_000)}</span
      >
      <span class="block text-xs text-muted-foreground"
        >dormant <code>decimals=&#123;3&#125;</code>:
        <span class="font-mono">{formatFrequency(128_225_000, 3)}</span></span
      >
    </dd>
    <dt class="text-muted-foreground">Member</dt>
    <dd>
      <span class="block"><Member {...alex} href="#member" /></span>
      <span class="block"
        ><Member {...sam} />
        <span class="text-xs text-muted-foreground"
          >name-private: first name</span
        ></span
      >
      <span class="block"
        ><Member {...jordan} showCid={false} />
        <span class="text-xs text-muted-foreground">CID off</span></span
      >
    </dd>
  </dl>
</Schemes>

<!-- ───────────────────────── Position ───────────────────────── -->
<h2 class={h2}>1. Position presets</h2>
<p class={lede}>
  Stacked by default, one line as an option. The radio name leads, frequency on
  its right; beneath it the short name, then the sector. Without a radio name
  the sector leads and the short name goes beneath. The airport sits in a narrow
  column on the left or at the end of the second line. A relief login shows as
  the position it resolves to; an unknown callsign shows alone.
</p>

<h3 class={h3}>Try it</h3>
<fieldset class="mb-3">
  <legend class="mb-2 text-sm text-muted-foreground">Fields</legend>
  <div class="flex flex-wrap gap-2">
    {#each FIELDS as f (f.key)}
      <label class={seg}
        ><input
          type="checkbox"
          class="sr-only"
          checked={fields.includes(f.key)}
          onchange={() => toggle(f.key)}
        />{f.label}</label
      >
    {/each}
  </div>
</fieldset>
<div class="mb-3 flex flex-wrap gap-x-6 gap-y-3">
  <fieldset>
    <legend class="mb-2 text-sm text-muted-foreground">Layout</legend>
    <div class="flex flex-wrap gap-2">
      {#each ["stacked", "inline"] as const as l (l)}
        <label class={seg}
          ><input
            type="radio"
            class="sr-only"
            name="layout"
            value={l}
            bind:group={layout}
          />{l === "stacked" ? "Stacked" : "One line"}</label
        >
      {/each}
    </div>
  </fieldset>
  <fieldset>
    <legend class="mb-2 text-sm text-muted-foreground">Airport</legend>
    <div class="flex flex-wrap gap-2">
      {#each ["left", "under"] as const as a (a)}
        <label class={seg}
          ><input
            type="radio"
            class="sr-only"
            name="airport"
            value={a}
            bind:group={airportAt}
          />{a === "left" ? "On the left" : "Beneath"}</label
        >
      {/each}
    </div>
  </fieldset>
  <fieldset>
    <legend class="mb-2 text-sm text-muted-foreground"
      >Decimals (dormant flag)</legend
    >
    <div class="flex flex-wrap gap-2">
      {#each [2, 3] as const as d (d)}
        <label class={seg}
          ><input
            type="radio"
            class="sr-only"
            name="decimals"
            value={d}
            bind:group={decimals}
          />{d}</label
        >
      {/each}
    </div>
  </fieldset>
</div>
<pre
  class="mb-3 overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs text-foreground">&lt;Position callsign="LEX_TWR" show=&#123;[{fields
    .map((f) => `"${f}"`)
    .join(", ")}]&#125;{layout === "inline"
    ? ' layout="inline"'
    : ""}{airportAt === "under" ? ' airportAt="under"' : ""}{decimals === 3
    ? " decimals={3}"
    : ""} /&gt;</pre>
<Schemes>
  <ul class="space-y-3">
    {#each [...new Set([...controllerRows, ...pilotRows])] as login (login)}<li>
        <Position {login} show={fields} {layout} {airportAt} {decimals} />
      </li>{/each}
  </ul>
</Schemes>

<h3 class={h3}>For controllers</h3>
<p class={lede}>
  Rows: Indy Center 83, Indianapolis Approach East, Lexington Tower, a relief
  login (IND_831_CTR, now just Falmouth 83), an unknown callsign (CMH_LCE).
</p>
<div
  class="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-2 xl:grid-cols-3"
>
  {#each controllerPresets as p (p.letter)}{@render presetCard(
      p,
      controllerRows,
    )}{/each}
</div>

<h3 class={h3}>For pilots</h3>
<p class={lede}>
  Cab positions show their airport and an approach its primary one; a center has
  none. The prototype guesses the airport from the callsign's prefix; the
  component would get it from data.
</p>
<div
  class="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-2 xl:grid-cols-4"
>
  {#each pilotPresets as p (p.letter)}{@render presetCard(p, pilotRows)}{/each}
  <Variant
    letter="P4"
    note="P1 in a list grouped by airport: the airport said once, as a heading."
  >
    {#each groups as g (g.title)}
      <h4
        class="mt-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
      >
        {g.title}
      </h4>
      <ul class="space-y-2">
        {#each g.logins as login (login)}<li>
            <Position {login} show={["radioName", "frequency"]} {decimals} />
          </li>{/each}
      </ul>
    {/each}
  </Variant>
</div>

<!-- ───────────────────────── Relief in lists ───────────────────────── -->
<h2 class={h2}>2. Two people on one position</h2>
<p class={lede}>
  IND_83_CTR and IND_831_CTR are both on. The position shows once, with everyone
  on it stacked beneath. Pilots see it once with no names.
</p>
<Pair>
  <div class="grid gap-6 sm:grid-cols-2">
    <div>
      <h3 class="mb-2 text-sm font-semibold text-foreground">
        Controllers (C2, with names)
      </h3>
      <ul class="divide-y divide-border text-sm">
        {#each byPosition as g (g.login)}
          <li class="py-2">
            <Position
              login={g.login}
              show={["callsign", "radioName", "name", "frequency"]}
              {decimals}
            />
            <ul class="mt-1 space-y-0.5">
              {#each g.members as m (m.cid)}<li><Member {...m} /></li>{/each}
            </ul>
          </li>
        {/each}
      </ul>
    </div>
    <div>
      <h3 class="mb-2 text-sm font-semibold text-foreground">Pilots (P2)</h3>
      <ul class="divide-y divide-border text-sm">
        {#each byPosition as g (g.login)}
          <li class="py-2">
            <Position
              login={g.login}
              show={["airport", "radioName", "frequency"]}
              {decimals}
            />
          </li>
        {/each}
      </ul>
    </div>
  </div>
</Pair>

<!-- ───────────────────────── OnlineController ───────────────────────── -->
<h2 class={h2}>3. OnlineController (next, once Position settles)</h2>
<p class={lede}>
  Unchanged for now apart from following "Try it" above. Tap a row to open it.
</p>
<Schemes>
  <ul
    class="max-w-[390px] overflow-hidden rounded-md border border-border bg-background"
  >
    <OnlineRow
      login="IND_831_CTR"
      member={jordan}
      loginTime={loggedIn}
      info={"Indy Center, Falmouth sector.\nExpected log-off time: 2330z"}
      show={fields}
      {layout}
      open
    />
    <OnlineRow
      login="LEX_TWR"
      member={sam}
      loginTime={new Date("2026-10-20T20:12:00Z")}
      info="Lexington Tower. Feedback: flyindycenter.com/feedback"
      show={fields}
      {layout}
    />
    <OnlineRow
      login="CMH_LCE"
      member={alex}
      loginTime={new Date("2026-10-20T20:51:00Z")}
      info="Training session."
      show={fields}
      {layout}
    />
  </ul>
</Schemes>
<div class="h-16"></div>
