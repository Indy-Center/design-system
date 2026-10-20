<script lang="ts">
  // PROTOTYPE for ticket 10 (surfaces, headings, text, prose). Throwaway:
  // never merged. Each section is one decision; its variants are lettered.
  import { Link } from "../../lib/index.ts";
  import Choice from "./Choice.svelte";
  import { lessonHtml } from "./lesson.ts";

  // Material Design Icons paths, as the apps' unplugin-icons `mdi` set.
  const icons = {
    account:
      "M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z",
    calendar:
      "M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1M17,12H12V17H17V12Z",
    chart:
      "M16,11.78L20.24,4.45L21.97,5.45L16.74,14.5L10.23,10.75L5.46,19H22V21H2V3H4V17.54L9.97,7.25L16,11.78Z",
    radar:
      "M12,3A9,9 0 0,0 3,12H5A7,7 0 0,1 12,5V3M12,7A5,5 0 0,0 7,12H9A3,3 0 0,1 12,9V7M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11Z",
  };
  type IconName = keyof typeof icons;

  const stats: {
    label: string;
    value: string;
    sub: string;
    icon: IconName;
    today: string;
  }[] = [
    {
      label: "Total users",
      value: "412",
      sub: "287 controllers",
      icon: "account",
      today: "bg-sky-600/20 text-sky-400",
    },
    {
      label: "Events",
      value: "38",
      sub: "31 published",
      icon: "calendar",
      today: "bg-purple-600/20 text-purple-400",
    },
    {
      label: "Event positions",
      value: "506",
      sub: "412 assigned",
      icon: "chart",
      today: "bg-cyan-600/20 text-cyan-400",
    },
  ];

  const controllers = [
    ["IND_CTR", "Indianapolis Center", "134.775"],
    ["IND_APP", "Indy Approach", "119.050"],
    ["SDF_TWR", "Louisville Tower", "124.200"],
  ];

  const card = "rounded-lg border border-border bg-card";
  const label =
    "text-sm font-semibold tracking-wide text-muted-foreground uppercase";
  const button =
    "inline-flex min-h-11 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
  const dots = (colour: string, size = 20) =>
    `background-image: radial-gradient(circle at 1px 1px, ${colour} 1px, transparent 0); background-size: ${size}px ${size}px;`;
</script>

<svelte:head><title>Surfaces and text · prototype</title></svelte:head>

{#snippet icon(name: IconName, cls: string)}
  <svg viewBox="0 0 24 24" class={cls} aria-hidden="true" fill="currentColor"
    ><path d={icons[name]} /></svg
  >
{/snippet}

<h1 class="font-heading text-3xl font-bold text-foreground">
  Surfaces, headings, text and prose
</h1>
<p class="mt-2 max-w-3xl text-muted-foreground">
  Throwaway prototype for ticket 10. Each section is one choice: its variants
  are lettered, use the bar to show one or all. Everything is on the role tokens
  except the variants marked "today", which use the apps' current slate and sky
  classes for comparison (they are dark-only, so they look wrong in light on
  purpose).
</p>
<nav aria-label="Sections" class="mt-4 mb-10">
  <ul class="flex flex-wrap gap-x-4 gap-y-1 text-sm">
    <li><Link href="#card">Card</Link></li>
    <li><Link href="#panel">Panel title bar</Link></li>
    <li><Link href="#page-header">PageHeader</Link></li>
    <li><Link href="#hero">PageHero</Link></li>
    <li><Link href="#stat">StatCard</Link></li>
    <li><Link href="#heading">Heading sizes</Link></li>
    <li><Link href="#label">Label look</Link></li>
    <li><Link href="#text">Text</Link></li>
    <li><Link href="#prose">Prose</Link></li>
  </ul>
</nav>

<!-- 1. Card surface -->
{#snippet cardBody(today = false)}
  <h3
    class={[
      "font-heading text-lg font-semibold",
      today ? "text-white" : "text-foreground",
    ]}
  >
    Friday Night Ops
  </h3>
  <p
    class={["mt-1 text-sm", today ? "text-gray-400" : "text-muted-foreground"]}
  >
    Fri 24 Oct · 2300–0200Z
  </p>
  <p class={["mt-3", today && "text-slate-300"]}>
    Full staffing across Indy Center and its approaches. Sign up for a position
    by Wednesday.
  </p>
{/snippet}

<Choice
  id="card"
  title="Card: the surface"
  question="One surface on the card role. How does it stand off the page: a border, a shadow, or both?"
  options={[
    { key: "A", desc: "Border only: bg-card, border-border." },
    { key: "B", desc: "Shadow only: bg-card, shadow-md, no border." },
    { key: "C", desc: "Both: bg-card, border-border and shadow-sm." },
    {
      key: "D",
      desc: "bg-slate-800/60 border-slate-700/60, the CW events card.",
      today: true,
    },
  ]}
  recommend="A. The border carries the card in dark, where a shadow can't show (B nearly vanishes there), and in light it's crisp on the grey page; C's shadow adds little and is one more thing to keep in step."
>
  {#snippet show(key)}
    {#if key === "A"}
      <div class="{card} p-5">{@render cardBody()}</div>
    {:else if key === "B"}
      <div class="rounded-lg bg-card p-5 shadow-md">{@render cardBody()}</div>
    {:else if key === "C"}
      <div class="{card} p-5 shadow-sm">{@render cardBody()}</div>
    {:else}
      <div
        class="rounded-lg border border-slate-700/60 bg-slate-800/60 p-5 backdrop-blur-sm"
      >
        {@render cardBody(true)}
      </div>
    {/if}
  {/snippet}
</Choice>

<!-- 2. Panel title bar -->
{#snippet panelList()}
  <ul class="divide-y divide-border">
    {#each controllers as [callsign, name, freq] (callsign)}
      <li class="flex items-center justify-between gap-3 px-4 py-3">
        <span>
          <span class="font-mono text-sm font-semibold text-foreground"
            >{callsign}</span
          >
          <span class="block text-sm text-muted-foreground">{name}</span>
        </span>
        <span class="font-mono text-sm">{freq}</span>
      </li>
    {/each}
  </ul>
{/snippet}

<Choice
  id="panel"
  title="Panel: the title bar"
  question="Panel is a card with a title bar above a body (often a divided list). How does the title read?"
  options={[
    {
      key: "A",
      desc: "Today's shape on roles: icon + uppercase title, foreground, rule under it.",
    },
    {
      key: "B",
      desc: "Sentence-case heading (text-base semibold), rule under it.",
    },
    {
      key: "C",
      desc: "Tinted bar (bg-muted), the label look (xs uppercase, muted-foreground), no rule.",
    },
    {
      key: "D",
      desc: "CW Panel: slate-800/60, h4 text-sm uppercase in white.",
      today: true,
    },
  ]}
  recommend="B. A real heading in sentence case reads as the panel's name and is easier to scan than shouting caps; the uppercase look stays for section labels inside a page. A is the safe second if the team wants today's feel."
>
  {#snippet show(key)}
    {#if key === "A"}
      <div class="{card} overflow-hidden">
        <div class="flex items-center gap-2 border-b border-border px-4 py-3">
          {@render icon("radar", "size-4 text-muted-foreground")}
          <h3
            class="text-sm font-semibold tracking-wide text-foreground uppercase"
          >
            Controllers online
          </h3>
        </div>
        {@render panelList()}
      </div>
    {:else if key === "B"}
      <div class="{card} overflow-hidden">
        <div class="flex items-center gap-2 border-b border-border px-4 py-3">
          {@render icon("radar", "size-5 text-muted-foreground")}
          <h3 class="font-heading text-base font-semibold text-foreground">
            Controllers online
          </h3>
        </div>
        {@render panelList()}
      </div>
    {:else if key === "C"}
      <div class="{card} overflow-hidden">
        <div class="flex items-center gap-2 bg-muted px-4 py-2.5">
          {@render icon("radar", "size-4 text-muted-foreground")}
          <h3
            class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
          >
            Controllers online
          </h3>
        </div>
        {@render panelList()}
      </div>
    {:else}
      <div
        class="h-fit rounded-lg border border-slate-700/60 bg-slate-800/60 text-white shadow-sm backdrop-blur-sm"
      >
        <div
          class="flex items-center gap-2 border-b border-slate-700/60 px-4 py-3"
        >
          {@render icon("radar", "size-4")}
          <h4 class="text-sm font-semibold tracking-wide uppercase">
            Controllers online
          </h4>
        </div>
        <ul class="divide-y divide-slate-700/60">
          {#each controllers as [callsign, name, freq] (callsign)}
            <li class="flex items-center justify-between gap-3 px-4 py-3">
              <span>
                <span class="font-mono text-sm font-semibold">{callsign}</span>
                <span class="block text-sm text-gray-400">{name}</span>
              </span>
              <span class="font-mono text-sm text-slate-300">{freq}</span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  {/snippet}
</Choice>

<!-- 3. PageHeader -->
<Choice
  id="page-header"
  title="PageHeader"
  question="The page title and its lead line, on the new palette. Room for actions?"
  options={[
    {
      key: "A",
      desc: "Today's shape on roles: h1 3xl bold foreground, lead mt-2 muted-foreground.",
    },
    {
      key: "B",
      desc: "A, with an actions slot on the right (stacks under on a phone) and a rule below.",
    },
    {
      key: "C",
      desc: "An eyebrow label above (the section), h1 semibold, lead text-lg foreground-soft.",
    },
    {
      key: "D",
      desc: "h1 text-3xl font-bold text-white, p mt-2 text-gray-400.",
      today: true,
    },
  ]}
  recommend="A, plus B's optional actions slot but without the rule. A is what all three apps already have; the slot covers admin pages' 'New event' buttons; the rule fights the cards below it."
>
  {#snippet show(key)}
    {#if key === "A"}
      <div>
        <h1 class="font-heading text-3xl font-bold text-foreground">Events</h1>
        <p class="mt-2 text-muted-foreground">
          Upcoming events in Indy Center, with positions to sign up for.
        </p>
      </div>
    {:else if key === "B"}
      <div
        class="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-start xl:flex-row xl:items-end"
      >
        <div>
          <h1 class="font-heading text-3xl font-bold text-foreground">
            Events
          </h1>
          <p class="mt-2 text-muted-foreground">
            Upcoming events in Indy Center, with positions to sign up for.
          </p>
        </div>
        <a href="#page-header" class="{button} self-start sm:self-auto"
          >New event</a
        >
      </div>
    {:else if key === "C"}
      <div>
        <p
          class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
        >
          Community
        </p>
        <h1 class="mt-1 font-heading text-3xl font-semibold text-foreground">
          Events
        </h1>
        <p class="mt-2 text-lg text-foreground-soft">
          Upcoming events in Indy Center, with positions to sign up for.
        </p>
      </div>
    {:else}
      <div>
        <h1 class="text-3xl font-bold text-white">Events</h1>
        <p class="mt-2 text-gray-400">
          Upcoming events in Indy Center, with positions to sign up for.
        </p>
      </div>
    {/if}
  {/snippet}
</Choice>

<!-- 4. PageHero -->
{#snippet heroText()}
  <h1
    class="font-heading text-4xl font-bold text-foreground sm:text-5xl lg:text-4xl xl:text-4xl"
  >
    Indy Center
  </h1>
  <p class="mt-2 text-foreground-soft">
    Virtual air traffic control over the Midwest, on VATSIM.
  </p>
{/snippet}

<Choice
  id="hero"
  title="PageHero and its halftone"
  question="The home page's hero, on the new palette. Does it follow the scheme or stay dark, and what do the dots look like?"
  options={[
    {
      key: "A",
      desc: "Today's hero ported: dark in both schemes, card → background gradient, white dots at 15%, 20px.",
    },
    {
      key: "B",
      desc: "Follows the scheme: card → background gradient, dots in the foreground role at 12%.",
    },
    {
      key: "C",
      desc: "Night (the brand black) in both schemes, left-aligned title, sky dots fading in from behind the text to the right.",
    },
    {
      key: "D",
      desc: "from-slate-700 to-slate-850 (not a colour, so it ends transparent), white dots.",
      today: true,
    },
  ]}
  recommend="C. Dark in both schemes like the header, so the hero reads as part of the chrome on a light page too; the night ground and fading sky dots give it the brand's colour without a stock gradient. A if the team prefers today's grey feel."
>
  {#snippet show(key)}
    {#if key === "A"}
      <div
        data-theme="dark"
        class="relative overflow-hidden rounded-md bg-linear-to-b from-card to-background"
      >
        <div
          class="absolute inset-0"
          style={dots("rgb(255 255 255 / 0.15)")}
        ></div>
        <div class="relative px-6 py-12 text-center">{@render heroText()}</div>
      </div>
    {:else if key === "B"}
      <div
        class="relative overflow-hidden rounded-md border border-border bg-linear-to-b from-card to-background"
      >
        <div
          class="absolute inset-0"
          style={dots(
            "color-mix(in srgb, var(--color-foreground) 12%, transparent)",
          )}
        ></div>
        <div class="relative px-6 py-12 text-center">{@render heroText()}</div>
      </div>
    {:else if key === "C"}
      <div
        data-theme="dark"
        class="relative overflow-hidden rounded-md bg-night"
      >
        <div
          class="absolute inset-0"
          style="{dots(
            'color-mix(in srgb, var(--color-link) 70%, transparent)',
            16,
          )} mask-image: linear-gradient(to right, transparent 15%, black 85%);"
        ></div>
        <div class="relative px-6 py-12 text-left">{@render heroText()}</div>
      </div>
    {:else}
      <div
        class="relative overflow-hidden rounded-md bg-gradient-to-b from-slate-700 text-white"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-slate-700/30 via-transparent to-slate-900/20 opacity-60"
        ></div>
        <div
          class="absolute inset-0"
          style={dots("rgba(255,255,255,0.15)")}
        ></div>
        <div class="relative px-6 py-12 text-center">
          <h1 class="text-4xl font-bold">Indy Center</h1>
          <p class="mt-2 text-gray-300">
            Virtual air traffic control over the Midwest, on VATSIM.
          </p>
        </div>
      </div>
    {/if}
  {/snippet}
</Choice>

<!-- 5. StatCard -->
<Choice
  id="stat"
  title="StatCard"
  question="Label, number, sub-line and icon tile, as on CW's admin dashboard."
  options={[
    {
      key: "A",
      desc: "Today's layout on roles: label sm muted, number 2xl, sub-line xs muted, one-colour icon tile (primary at 15%, link icon).",
    },
    {
      key: "B",
      desc: "Label look (xs uppercase) with a small inline icon, number 3xl, sub-line sm; no tile.",
    },
    {
      key: "C",
      desc: "Number first (3xl), label under it in body colour, sub-line sm muted; neutral tile (bg-muted) on the left.",
    },
    {
      key: "D",
      desc: "slate-800/50 card, gray-400 label, slate-500 sub-line, sky/purple/cyan tiles.",
      today: true,
    },
  ]}
  recommend="A, with the sub-line at text-sm. Same reading order as today (label, then number), one tile colour so colour isn't decoration; the sub-line moves off xs for contrast and legibility. All are a dl (dt label, dd number)."
>
  {#snippet show(key)}
    <div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-1">
      {#each stats as s (s.label)}
        {#if key === "A"}
          <dl class="{card} flex items-center justify-between gap-3 p-4">
            <div>
              <dt class="text-sm text-muted-foreground">{s.label}</dt>
              <dd
                class="mt-1 font-heading text-2xl font-semibold text-foreground"
              >
                {s.value}
              </dd>
              <dd class="mt-1 text-xs text-muted-foreground">{s.sub}</dd>
            </div>
            <dd class="rounded-lg bg-primary/15 p-3 text-link">
              {@render icon(s.icon, "size-6")}
            </dd>
          </dl>
        {:else if key === "B"}
          <dl class="{card} p-4">
            <dt
              class="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase"
            >
              {@render icon(s.icon, "size-4")}{s.label}
            </dt>
            <dd
              class="mt-2 font-heading text-3xl font-semibold text-foreground"
            >
              {s.value}
            </dd>
            <dd class="mt-1 text-sm text-muted-foreground">{s.sub}</dd>
          </dl>
        {:else if key === "C"}
          <dl
            class="{card} flex flex-row-reverse items-center justify-end gap-4 p-4"
          >
            <div class="flex flex-col">
              <dt class="order-2 text-sm">{s.label}</dt>
              <dd
                class="order-1 font-heading text-3xl font-semibold text-foreground"
              >
                {s.value}
              </dd>
              <dd class="order-3 mt-1 text-sm text-muted-foreground">
                {s.sub}
              </dd>
            </div>
            <dd class="rounded-lg bg-muted p-3 text-foreground">
              {@render icon(s.icon, "size-6")}
            </dd>
          </dl>
        {:else}
          <div
            class="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-400">{s.label}</p>
                <p class="mt-1 text-2xl font-semibold text-white">{s.value}</p>
                <p class="mt-1 text-xs text-slate-500">{s.sub}</p>
              </div>
              <div class="rounded-lg p-3 {s.today}">
                {@render icon(s.icon, "size-6")}
              </div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  {/snippet}
</Choice>

<!-- 6. Heading sizes -->
{#snippet headings(sizes: string[])}
  <div class="space-y-3">
    {#each sizes as cls, i (i)}
      <svelte:element
        this={"h" + (i + 1)}
        class="font-heading text-foreground {cls}"
      >
        <span class="mr-2 font-mono text-xs font-normal text-muted-foreground"
          >h{i + 1}</span
        >{["Training", "Ground control", "Taxi basics", "Before the session"][
          i
        ]}
      </svelte:element>
    {/each}
    <p>Body text under the headings, at text-base, for scale.</p>
  </div>
{/snippet}

<Choice
  id="heading"
  title="Heading: a size for each level"
  question="Heading's page and section looks: which size goes with each level by default?"
  options={[
    {
      key: "A",
      desc: "Today's ladder: h1 3xl bold, h2 2xl, h3 xl, h4 lg (all semibold below h1).",
    },
    {
      key: "B",
      desc: "Tighter: h1 3xl bold, h2 xl, h3 lg, h4 base.",
    },
    {
      key: "C",
      desc: "Bigger title, tight below: h1 4xl bold tracking-tight, h2 2xl, h3 lg, h4 base.",
    },
  ]}
  recommend="B. Pages here are dense (lists, panels, forms), and h2 at 2xl competes with the page title; B keeps the 3xl title all three apps share and steps down evenly. h4 at base still reads as a heading by weight."
>
  {#snippet show(key)}
    {#if key === "A"}
      {@render headings([
        "text-3xl font-bold",
        "text-2xl font-semibold",
        "text-xl font-semibold",
        "text-lg font-semibold",
      ])}
    {:else if key === "B"}
      {@render headings([
        "text-3xl font-bold",
        "text-xl font-semibold",
        "text-lg font-semibold",
        "text-base font-semibold",
      ])}
    {:else}
      {@render headings([
        "text-4xl font-bold tracking-tight",
        "text-2xl font-semibold",
        "text-lg font-semibold",
        "text-base font-semibold",
      ])}
    {/if}
  {/snippet}
</Choice>

<!-- 7. The label look -->
{#snippet labelled(cls: string)}
  <h3 class={cls}>Teacher notes</h3>
  <p class="mt-2">Ask what "hold short" means before the first clearance.</p>
  <h3 class="mt-4 {cls}">Required tasks</h3>
  <p class="mt-2">1.1 Issue a taxi clearance</p>
{/snippet}

<Choice
  id="label"
  title="Heading: the label look"
  question="The uppercase section label all three apps use (LIB's h2, TT's h3, CW's h3/h4). What size and colour?"
  options={[
    {
      key: "A",
      desc: "text-xs semibold, tracking-wider, uppercase, muted-foreground.",
    },
    {
      key: "B",
      desc: "text-sm semibold, tracking-wide, uppercase, muted-foreground (today's size on the role).",
    },
    {
      key: "C",
      desc: "No caps: text-sm semibold, foreground.",
    },
    {
      key: "D",
      desc: "text-sm font-semibold tracking-wide uppercase text-gray-400.",
      today: true,
    },
  ]}
  recommend="A. At xs the caps sit quietly above the content they label, which is the job; B's sm caps start to compete with h3s. muted-foreground passes 4.5:1 on background and card in both schemes."
>
  {#snippet show(key)}
    {#if key === "A"}
      {@render labelled(
        "text-xs font-semibold tracking-wider text-muted-foreground uppercase",
      )}
    {:else if key === "B"}
      {@render labelled(label)}
    {:else if key === "C"}
      {@render labelled("text-sm font-semibold text-foreground")}
    {:else}
      {@render labelled(
        "text-sm font-semibold tracking-wide text-gray-400 uppercase",
      )}
    {/if}
  {/snippet}
</Choice>

<!-- 8. Text -->
{#snippet textSet(lead: string, muted: string, small: string, body = "")}
  <div class="space-y-3">
    <p class={lead}>
      <span class="mr-1 font-mono text-[10px] text-muted-foreground">lead</span
      >Courses, lesson plans and competencies for Indy Center's controllers.
    </p>
    <p class={body}>
      <span class="mr-1 font-mono text-[10px] text-muted-foreground">body</span
      >Each lesson plan lists the tasks a student practises, with the reading to
      do before the session.
    </p>
    <p class={muted}>
      <span class="mr-1 font-mono text-[10px] text-muted-foreground">muted</span
      >Last updated 1 October 2026 by 1234567.
    </p>
    <p class={small}>
      <span class="mr-1 font-mono text-[10px] text-muted-foreground">small</span
      >Times are in Zulu (UTC). Draft versions are visible to authors only.
    </p>
  </div>
{/snippet}

<Choice
  id="text"
  title="Text: lead, muted and small against body"
  question="Body text comes from the page (foreground-soft). How do lead, muted and small differ from it?"
  options={[
    {
      key: "A",
      desc: "Today's mapping on roles: lead base muted-foreground; muted base muted-foreground; small xs muted-foreground.",
    },
    {
      key: "B",
      desc: "Lead lg foreground-soft; muted base muted-foreground; small sm muted-foreground.",
    },
    {
      key: "C",
      desc: "Lead lg muted-foreground; muted sm muted-foreground; small xs muted-foreground.",
    },
    {
      key: "D",
      desc: "body text-slate-300, lead/muted text-gray-400, small text-xs text-gray-500.",
      today: true,
    },
  ]}
  recommend="B. Lead differs from muted by size, not by being greyer, so it reads as an introduction; small stays at text-sm, since 12px muted text is the fine print the inventory flagged. Text then has tone (default, muted) and size (base, sm), no xs."
>
  {#snippet show(key)}
    {#if key === "A"}
      {@render textSet(
        "text-muted-foreground",
        "text-muted-foreground",
        "text-xs text-muted-foreground",
      )}
    {:else if key === "B"}
      {@render textSet(
        "text-lg text-foreground-soft",
        "text-muted-foreground",
        "text-sm text-muted-foreground",
      )}
    {:else if key === "C"}
      {@render textSet(
        "text-lg text-muted-foreground",
        "text-sm text-muted-foreground",
        "text-xs text-muted-foreground",
      )}
    {:else}
      {@render textSet(
        "text-gray-400",
        "text-gray-400",
        "text-xs text-gray-500",
        "text-slate-300",
      )}
    {/if}
  {/snippet}
</Choice>

<!-- 9. Prose -->
<Choice
  id="prose"
  title="Prose: a lesson plan under prose-centerline"
  question="indy-library's lesson-plan HTML in a role-based prose theme that follows data-theme (no prose-invert). Link colour and underline; tables, lists, quotes, code."
  start="B"
  options={[
    {
      key: "A",
      desc: "Plugin shapes, role colours: links link-coloured, weight 500, plain underline; backticked code; grey quote rule.",
    },
    {
      key: "B",
      desc: "A, plus links matching Link (normal weight, offset underline, 2px on hover), code as a muted chip, sky quote rule without quote marks, muted table head.",
    },
    {
      key: "C",
      desc: "LIB's lesson page: prose prose-invert prose-a:text-sky-300.",
      today: true,
    },
  ]}
  recommend="B. Prose links look like every other Link; inline code (ICAO codes, frequencies) reads as a token, not as `quoted` text; the table head marks itself without the plugin's heavy rule. Ship it as @utility prose-centerline in base.css."
>
  {#snippet show(key)}
    {#if key === "A"}
      <article class="prose max-w-none proto-prose-a">
        {@html lessonHtml}
      </article>
    {:else if key === "B"}
      <article class="prose max-w-none proto-prose-b">
        {@html lessonHtml}
      </article>
    {:else}
      <article
        class="prose max-w-none prose-invert prose-a:text-sky-300 prose-img:rounded-lg"
      >
        {@html lessonHtml}
      </article>
    {/if}
  {/snippet}
</Choice>
