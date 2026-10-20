<script lang="ts">
  // Throwaway prototype (ticket centerline-packages/08), round 2: the user's
  // feedback on round 1 (commit 221dbef). Settled picks at the top; then the
  // open questions: which Position fields, two-decimal frequencies, the member
  // format in real contexts, and the date. Positions come from a slim
  // snapshot of ZID's vNAS Data Admin, read 2026-10-20. Members are made up.
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Schemes from "../../playground/Schemes.svelte";
  import CopyFrequency from "./CopyFrequency.svelte";
  import Member, { type MemberFormat, type Privacy } from "./Member.svelte";
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
    durationShort,
    formatDate,
    formatFrequency,
    localTime,
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
    fromQuery.length ? fromQuery : ["radioName", "name", "frequency"],
  );
  let layout = $state<"inline" | "stacked">(
    q.get("layout") === "inline" ? "inline" : "stacked",
  );
  let format = $state<MemberFormat>(
    (["A", "B", "C", "D"].includes(q.get("member") ?? "")
      ? q.get("member")
      : "A") as MemberFormat,
  );
  let privacy = $state<Privacy>(
    (["today", "first", "cid"].includes(q.get("privacy") ?? "")
      ? q.get("privacy")
      : "today") as Privacy,
  );

  $effect(() => {
    const u = new URL(page.url.href);
    u.searchParams.set("fields", fields.join(","));
    u.searchParams.set("layout", layout);
    u.searchParams.set("member", format);
    u.searchParams.set("privacy", privacy);
    if (u.search !== page.url.search)
      goto(u, { state: {}, shallow: true, replace: true, reset: false });
  });

  function toggle(f: Field) {
    if (fields.includes(f)) {
      if (fields.length > 1) fields = fields.filter((x) => x !== f);
    } else fields = allFields.filter((x) => x === f || fields.includes(x));
  }

  const showcase = [
    "IND_83_CTR",
    "IND_E_APP",
    "LEX_TWR",
    "IND_831_CTR",
    "CMH_LCE",
  ];
  const presets: {
    letter: string;
    note: string;
    show: Field[];
    pick?: boolean;
  }[] = [
    {
      letter: "A",
      note: "Radio name only: what a pilot hears. 29 rows would read 'Indy Center'.",
      show: ["radioName"],
    },
    {
      letter: "B",
      note: "Sector name only: short, but 'Local Control' means little alone.",
      show: ["name"],
    },
    {
      letter: "C",
      note: "Radio name, sector beneath.",
      show: ["radioName", "name"],
    },
    {
      letter: "D",
      pick: true,
      note: "Radio name, sector beneath, frequency right. The default for a position on its own.",
      show: ["radioName", "name", "frequency"],
    },
    {
      letter: "E",
      note: "Sector and frequency, for lists already grouped by facility.",
      show: ["name", "frequency"],
    },
    {
      letter: "F",
      note: "Everything, callsign last (the short name will take its place).",
      show: ["radioName", "name", "frequency", "callsign"],
    },
  ];

  const freqs = [128_225_000, 121_900_000, 119_100_000, 124_950_000];

  const alex = { first: "Alex", last: "Example", cid: 1000001 };
  const sam = { first: "Sam", last: "Private", cid: 1000002, hidden: true };
  const jordan = { first: "Jordan", last: "Sample", cid: 1000004 };
  const pat = { first: "Pat", last: "Pilot", cid: 1234567 };

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
  const dateStyles: { letter: DateStyle; note: string; pick?: boolean }[] = [
    {
      letter: "A",
      pick: true,
      note: "Short weekday and month: Tue, Oct 20 (round 1's).",
    },
    { letter: "B", note: "Spelled out: Tuesday, October 20." },
    { letter: "C", note: "No weekday: Oct 20." },
    {
      letter: "D",
      note: "Today, Tomorrow, a weekday this week; A after that.",
    },
    {
      letter: "E",
      note: "Day before month, as aviation writes it: Tue 20 Oct.",
    },
  ];

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
</script>

<svelte:head
  ><title>Aviation prototype, round 2 · Centerline playground</title
  ></svelte:head
>

{#snippet credential(c: (typeof CREDENTIALS)[number])}
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
{/snippet}

{#snippet range(e: (typeof events)[number], style: DateStyle)}
  <time datetime={e.start.toISOString()}
    >{formatDate(e.start, style)}, {hm(e.start)}</time
  >–<time datetime={e.end.toISOString()}>{localTime(e.end)}</time>
  <span class="whitespace-nowrap text-muted-foreground"
    >· {zulu(e.start)}–{zulu(e.end)}</span
  >
{/snippet}

<h1 class="mb-2 font-heading text-3xl font-semibold text-foreground">
  Aviation prototype, round 2
</h1>
<p class={lede}>
  Throwaway. Round 1's picks are settled below; the rest is your feedback, built
  out. Positions and frequencies are ZID's real Data Admin entries; members are
  made up. Clock pinned to 21:00Z, Oct 20, shown in Indianapolis time. The
  switches on this page are kept in the URL, so a set-up can be shared.
</p>

<!-- ───────────────────────── Settled ───────────────────────── -->
<h2 class={h2}>Settled in round 1</h2>
<p class={lede}>
  7A time, 8A relative, 9B rating (not shown unless asked for), 10A credential,
  11A flight category (LIFR turns magenta with ticket 49), and both airport
  looks as an option.
</p>
<Schemes>
  <dl class="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-2 text-sm">
    <dt class="text-muted-foreground">Time</dt>
    <dd>
      <time datetime="2026-10-20T23:00:00Z"
        >{localTime(events[0].start)} · {zulu(events[0].start)}</time
      >
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
      {#each CREDENTIALS as c (c.code)}{@render credential(c)}{/each}
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
    </dd>
    <dt class="text-muted-foreground">Airport</dt>
    <dd>
      <span class="block"
        ><span class="font-mono font-semibold text-foreground">KIND</span>
        <span class="text-sm text-muted-foreground"
          >Indianapolis International</span
        ></span
      >
      <span class="block text-xs text-muted-foreground"
        >name shown (default)</span
      >
      <span class="mt-1 block"
        >{#each AIRPORTS as a, i (a.icao)}{i ? " " : ""}<abbr
            title={a.name}
            class="font-mono font-semibold text-foreground decoration-dotted"
            >{a.icao}</abbr
          >{/each}</span
      >
      <span class="block text-xs text-muted-foreground"
        >name hidden, for controllers; tooltip on hover, focus and tap</span
      >
    </dd>
  </dl>
</Schemes>

<!-- ───────────────────────── Position ───────────────────────── -->
<h2 class={h2}>1. Position: any of its fields</h2>
<p class={lede}>
  One component, a <code>show</code> list picks the fields. The first text field leads;
  the others follow, muted. The callsign is one field like the rest, off unless asked
  for, and the vNAS short name replaces it when it's published. An unknown callsign
  has nothing else to show, so it shows alone whatever the list says; a relief login
  only says so when the callsign is shown.
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
<fieldset class="mb-3">
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
<pre
  class="mb-3 overflow-x-auto rounded-md bg-muted p-2 font-mono text-xs text-foreground">&lt;Position callsign="IND_83_CTR" show=&#123;[{fields
    .map((f) => `"${f}"`)
    .join(", ")}]&#125;{layout === "inline"
    ? ' layout="inline"'
    : ""} /&gt;</pre>
<Schemes>
  <ul class="space-y-3">
    {#each showcase as login (login)}<li>
        <Position {login} show={fields} {layout} />
      </li>{/each}
  </ul>
</Schemes>

<h3 class={h3}>Presets</h3>
<p class={lede}>
  Stacked. Rows: Indy Center 83, Indianapolis Approach East, Lexington Tower, a
  relief login (IND_831_CTR), an unknown one (CMH_LCE).
</p>
<div
  class="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-2 xl:grid-cols-3"
>
  {#each presets as p (p.letter)}
    <Variant letter={p.letter} pick={p.pick} note={p.note}>
      {#each showcase as login (login)}<Position {login} show={p.show} />{/each}
    </Variant>
  {/each}
</div>

<!-- ───────────────────────── Frequency ───────────────────────── -->
<h2 class={h2}>2. Frequency: two decimals</h2>
<p class={lede}>
  The third decimal is cut, not rounded: 128.225 shows as 128.22, as it's
  spoken. 45 of ZID's 157 positions end in 25 or 75. Screen readers still get
  "one two eight point two two". Open now: keep a trailing zero, and whether
  'MHz' or a copy button comes back.
</p>
<Schemes>
  <Variant letter="A" pick note="Always two decimals: 121.90. Columns line up.">
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
  <Variant letter="B" note="Trailing zero dropped: 121.9, as charts write it.">
    {#each freqs as hz (hz)}
      <p>
        <span class="font-mono text-foreground tabular-nums"
          >{formatFrequency(hz, true)}</span
        >
      </p>
    {/each}
  </Variant>
  <Variant letter="C" note="A, with a muted 'MHz'.">
    {#each freqs as hz (hz)}
      <p>
        <span class="font-mono text-foreground tabular-nums"
          >{formatFrequency(hz)}</span
        > <span class="text-sm text-muted-foreground">MHz</span>
      </p>
    {/each}
  </Variant>
  <Variant letter="D" note="A, with a copy button.">
    {#each freqs.slice(0, 2) as hz (hz)}<p><CopyFrequency {hz} /></p>{/each}
  </Variant>
</Schemes>

<!-- ───────────────────────── Member ───────────────────────── -->
<h2 class={h2}>3. Member, in context</h2>
<p class={lede}>
  The four formats from round 1, switched below, across the places members
  appear. Sam is name-private: today the CID stands in for the last name, so
  formats print it twice. The second switch tries the alternatives.
</p>
<fieldset class="mb-3">
  <legend class="mb-2 text-sm text-muted-foreground">Format</legend>
  <div class="flex flex-wrap gap-2">
    {#each [["A", "Name 1000001"], ["B", "Name (1000001)"], ["C", "Stacked"], ["D", "Name · CID 1000001"]] as [k, label] (k)}
      <label class={seg}
        ><input
          type="radio"
          class="sr-only"
          name="member"
          value={k}
          bind:group={format}
        /><span class="font-mono font-semibold">{k}</span>
        {label}</label
      >
    {/each}
  </div>
</fieldset>
<fieldset class="mb-4">
  <legend class="mb-2 text-sm text-muted-foreground">Name-private member</legend
  >
  <div class="flex flex-wrap gap-2">
    {#each [["today", "Today: CID as last name"], ["first", "First name only"], ["cid", "CID only"]] as [k, label] (k)}
      <label class={seg}
        ><input
          type="radio"
          class="sr-only"
          name="privacy"
          value={k}
          bind:group={privacy}
        />{label}</label
      >
    {/each}
  </div>
</fieldset>

<Pair>
  <h3 class="mb-2 text-sm font-semibold text-foreground">Roster</h3>
  <div class="overflow-x-auto">
    <table class="w-full text-left text-sm">
      <thead class="text-xs text-muted-foreground">
        <tr
          ><th class="py-1 pr-3 font-medium">Member</th><th
            class="py-1 pr-3 font-medium">Credentials</th
          ><th class="py-1 font-medium">Joined</th></tr
        >
      </thead>
      <tbody>
        {#each [{ m: alex, c: [0, 1], j: "Mar 2, 2024" }, { m: sam, c: [0, 2], j: "Jun 18, 2025" }, { m: jordan, c: [3], j: "Sep 9, 2026" }] as row (row.m.cid)}
          <tr class="border-t border-border align-top">
            <td class="py-2 pr-3"
              ><Member {...row.m} {format} {privacy} href="#member" /></td
            >
            <td class="py-2 pr-3"
              ><span class="flex flex-wrap gap-1"
                >{#each row.c as i (i)}{@render credential(
                    CREDENTIALS[i],
                  )}{/each}</span
              ></td
            >
            <td class="py-2 whitespace-nowrap">{row.j}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <h3 class="mt-5 mb-2 text-sm font-semibold text-foreground">
    Event positions
  </h3>
  <ul class="divide-y divide-border text-sm">
    {#each [{ l: "IND_83_CTR", m: alex }, { l: "IND_E_APP", m: sam }, { l: "LEX_TWR", m: jordan }] as s (s.l)}
      <li class="flex items-start justify-between gap-3 py-2">
        <Position login={s.l} show={["radioName", "name"]} />
        <span class="text-right"><Member {...s.m} {format} {privacy} /></span>
      </li>
    {/each}
  </ul>

  <h3 class="mt-5 mb-2 text-sm font-semibold text-foreground">Feedback</h3>
  <article class="rounded-md border border-border bg-card p-3 text-sm">
    <p class="mb-1"><Member {...alex} {format} {privacy} href="#member" /></p>
    <p class="text-muted-foreground">
      Indy Center · Falmouth 83, {formatDate(
        new Date("2026-10-19T22:00:00Z"),
        "A",
      )}
    </p>
    <p class="my-2 text-foreground-soft">
      “Smooth handoff into Indy Approach, thanks!”
    </p>
    <p class="text-muted-foreground">
      From <Member {...pat} {format} {privacy} />
    </p>
  </article>

  <h3 class="mt-5 mb-2 text-sm font-semibold text-foreground">In a sentence</h3>
  <p class="text-sm">
    <Member {...sam} {format} {privacy} /> passed the S-GC practical with
    <Member {...jordan} {format} {privacy} href="#member" /> on {formatDate(
      new Date("2026-10-18T23:00:00Z"),
      "A",
    )}.
  </p>
</Pair>

<!-- ───────────────────────── Date ───────────────────────── -->
<h2 class={h2}>4. Date</h2>
<p class={lede}>
  The time stays 7A; only the date part changes. Four events: tonight, tomorrow,
  next week, and next March (which shows the year and EST). The Zulu range
  carries no date of its own, even when it crosses Zulu midnight.
</p>
<div
  class="grid gap-3 rounded-lg border border-border bg-background p-4 lg:grid-cols-2"
>
  {#each dateStyles as d (d.letter)}
    <Variant letter={d.letter} pick={d.pick} note={d.note}>
      <ul class="space-y-2 text-sm">
        {#each events as e (e.name)}
          <li>
            <span class="block font-semibold text-foreground">{e.name}</span
            >{@render range(e, d.letter)}
          </li>
        {/each}
      </ul>
    </Variant>
  {/each}
</div>

<!-- ───────────────────────── OnlineController ───────────────────────── -->
<h2 class={h2}>5. OnlineController</h2>
<p class={lede}>
  Rebuilt: the Position uses the fields picked in point 1, the member the format
  in point 3, frequency two decimals, no rating. The callsign and any relief
  note move into the open part. Tap a row to open it.
</p>
<Schemes>
  <ul
    class="max-w-[390px] overflow-hidden rounded-md border border-border bg-background"
  >
    <OnlineRow
      login="IND_831_CTR"
      member={alex}
      loginTime={loggedIn}
      info={"Indy Center, Falmouth sector.\nExpected log-off time: 2330z"}
      show={fields}
      {format}
      {privacy}
      open
    />
    <OnlineRow
      login="LEX_TWR"
      member={sam}
      loginTime={new Date("2026-10-20T20:12:00Z")}
      info="Lexington Tower. Feedback: flyindycenter.com/feedback"
      show={fields}
      {format}
      {privacy}
    />
    <OnlineRow
      login="CMH_LCE"
      member={jordan}
      loginTime={new Date("2026-10-20T20:51:00Z")}
      info="Training session."
      show={fields}
      {format}
      {privacy}
    />
  </ul>
</Schemes>
<div class="h-16"></div>
