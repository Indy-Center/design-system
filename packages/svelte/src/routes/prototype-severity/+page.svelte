<script lang="ts">
  // Throwaway prototype (ticket 09): the severity scale for Alert, Toast and
  // the documents feature's Callout. Never merged.
  import type { Snippet } from "svelte";
  import Schemes from "../../playground/Schemes.svelte";
  import Alert from "./Alert.svelte";
  import Callout from "./Callout.svelte";
  import Icon from "./Icon.svelte";
  import Toasts from "./Toasts.svelte";
  import { results } from "./contrast.svelte.ts";
  import {
    calloutLevels,
    icon,
    iconSets,
    levels,
    spoken,
    text,
    type AlertStyle,
    type IconSet,
    type Level,
  } from "./levels.ts";

  const messages: Record<Level, { title: string; message: string }> = {
    info: {
      title: "Roster sync",
      message: "The roster updates from VATSIM every hour.",
    },
    success: {
      title: "Saved",
      message: "Your availability for Friday was saved.",
    },
    caution: {
      title: "Session soon",
      message: "Your OTS exam starts in 30 minutes.",
    },
    danger: {
      title: "Not saved",
      message: "We couldn't save the event. Try again.",
    },
  };

  const styles: { id: string; style: AlertStyle; note: string }[] = [
    {
      id: "A",
      style: "tinted",
      note: "A light wash of the role with a faint border; body text stays body colour, the icon takes the role.",
    },
    {
      id: "B",
      style: "bordered",
      note: "A card with a 4px left rule in the role; only the rule and the icon carry colour.",
    },
    {
      id: "C",
      style: "filled",
      note: "The role as the fill, text in the card colour (white in light, slate in dark).",
    },
  ];

  const calloutVariants = ["A", "B"] as const;
  const schemes = ["light", "dark", "dark-header"];
  const parts = [
    ["text", 4.5],
    ["icon", 3],
  ] as const;

  const recommendations = [
    [
      "Alert style",
      "A, tinted: calm in both schemes, body text keeps its contrast, and it reads as a box without shouting.",
    ],
    [
      "Icon set",
      "A, filled with a different shape each (circle, circle-check, triangle, octagon): shape alone tells caution from danger.",
    ],
    [
      "Title",
      "Both, as an optional prop: title for a page-level message, none for a one-liner. The spoken label is always there.",
    ],
    [
      "Dismissible",
      "Off by default, an opt-in prop (B) for messages that are only news.",
    ],
    [
      "Toast placement",
      "B, bottom centre: one rule at every width, clear of the dark header and its menus, near the thumb on a phone.",
    ],
    [
      "Toast duration",
      "C, by level: info and success time out and pause on hover or focus (WCAG 2.2.1); caution and danger stay.",
    ],
    ["Toast dismissal", "A, a close button on every toast, and Escape."],
    [
      "Toast stacking",
      "A, a list of 3 at most: everything stays readable without hovering.",
    ],
    [
      "Callout",
      "B, FAA label and rule: the words controllers know, quiet in long text; colours and icons shared with Alert.",
    ],
  ];
</script>

<svelte:head
  ><title>Severity prototype · Centerline playground</title></svelte:head
>

{#snippet heading(title: string, intro: string)}
  <h2 class="mt-10 mb-1 font-heading text-2xl font-semibold text-foreground">
    {title}
  </h2>
  <p class="mb-4 max-w-prose">{intro}</p>
{/snippet}

{#snippet variant(letter: string, note: string, body: Snippet)}
  <div class="mb-6 last:mb-0">
    <p class="mb-2 text-sm">
      <span class="font-heading text-lg font-bold text-foreground"
        >{letter}</span
      >
      <span class="text-muted-foreground">{note}</span>
    </p>
    <div class="space-y-3">{@render body()}</div>
  </div>
{/snippet}

<h1 class="mb-2 font-heading text-3xl font-semibold text-foreground">
  Severity scale prototype
</h1>
<p class="max-w-prose">
  Throwaway. Four levels on four roles: <code>info</code> (info),
  <code>success</code> (success), <code>caution</code> (warning),
  <code>danger</code> (destructive). Each has an MDI icon and a spoken label read
  before the message ("Caution: …"), so colour is never the only signal. Each choice
  shows its options side by side as A, B, C.
</p>

<section class="mt-6 rounded-lg border border-border bg-card p-4">
  <h2 class="mb-2 font-heading text-xl font-semibold text-foreground">
    Recommended
  </h2>
  <dl class="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
    {#each recommendations as [point, pick] (point)}
      <dt class="font-semibold text-foreground">{point}</dt>
      <dd>{pick}</dd>
    {/each}
  </dl>
</section>

{@render heading(
  "1. Alert: tinted, bordered or filled",
  "Each alert prints its measured contrast: body text against what is really behind it (4.5:1 needed), and the icon against the same (3:1 needed).",
)}
<Schemes>
  {#each styles as s (s.id)}
    {#snippet body()}
      {#each levels as level (level)}
        <Alert
          {level}
          variant={s.style}
          message={messages[level].message}
          measured
        />
      {/each}
    {/snippet}
    {@render variant(s.id, s.note, body)}
  {/each}
</Schemes>

{@render heading(
  "2. Alert: icon set",
  "MDI paths from @mdi/js, 20px, in the role colour. Reference is the Callout's extra level.",
)}
<Schemes>
  {#each Object.entries(iconSets) as [id, set] (id)}
    {#snippet body()}
      <ul class="flex flex-wrap gap-x-4 gap-y-2">
        {#each calloutLevels as level (level)}
          <li class={["flex items-center gap-1.5 text-sm", text[level]]}>
            <Icon path={icon(level, id as IconSet)} size={24} />
            <span class="text-foreground-soft">{spoken[level]}</span>
          </li>
        {/each}
      </ul>
      <Alert
        level="caution"
        iconSet={id as IconSet}
        message={messages.caution.message}
      />
      <Alert
        level="danger"
        iconSet={id as IconSet}
        message={messages.danger.message}
      />
    {/snippet}
    {@render variant(id, set.name, body)}
  {/each}
</Schemes>

{@render heading(
  "3. Alert: with or without a title",
  "Without a title, the spoken label is hidden text before the message; with one, it's hidden before the title.",
)}
{#snippet titled()}
  {#each levels as level (level)}
    <Alert
      {level}
      title={messages[level].title}
      message={messages[level].message}
    />
  {/each}
{/snippet}
{#snippet untitled()}
  {#each levels as level (level)}
    <Alert {level} message={messages[level].message} />
  {/each}
{/snippet}
<Schemes>
  {@render variant(
    "A",
    "With a title: a bold first line in the heading colour.",
    titled,
  )}
  {@render variant("B", "Without: one line, for short messages.", untitled)}
</Schemes>

{@render heading(
  "4. Alert: dismissible or not",
  "Click the close buttons; a dismissed alert leaves a button to bring it back (playground only).",
)}
{#snippet fixed()}
  <Alert level="info" message={messages.info.message} />
  <Alert level="danger" message={messages.danger.message} />
{/snippet}
{#snippet closable()}
  <Alert level="info" message={messages.info.message} dismissible />
  <Alert level="danger" message={messages.danger.message} dismissible />
{/snippet}
<Schemes>
  {@render variant("A", "Not dismissible: stays while it's true.", fixed)}
  {@render variant(
    "B",
    "Dismissible: a 44px close button named after the message.",
    closable,
  )}
</Schemes>

{@render heading(
  "5. Toast",
  "Pick an option in each bar, then raise toasts. They appear for real, in the chosen place, and are announced through live regions.",
)}
<Toasts />

{@render heading(
  "6. Callout in prose (documents feature)",
  "The same scale inside a document, plus reference with no colour. Each prints its label and icon contrast.",
)}
<Schemes>
  {#each calloutVariants as v (v)}
    {#snippet body()}
      <article class="max-w-prose leading-relaxed">
        <h3 class="font-heading text-lg font-semibold text-foreground">
          2-1-6. Safety alert
        </h3>
        <p class="mt-2">
          Issue a safety alert to an aircraft if you are aware the aircraft is
          in a position which places it in unsafe proximity to terrain or other
          aircraft.
        </p>
        <Callout
          level="info"
          variant={v}
          message="The issuance of a safety alert is a first priority."
        />
        <Callout
          level="caution"
          variant={v}
          message="Don't assume the pilot has the traffic in sight."
        />
        <Callout
          level="danger"
          variant={v}
          message="Failing to issue the alert may leave the aircraft below the MVA."
        />
        <Callout
          level="success"
          variant={v}
          message="Your answers to this lesson's check were all correct."
        />
        <Callout
          level="reference"
          variant={v}
          message="JO 7110.65BB 2-1-6, Safety Alert."
        />
        <p>Recognition of conditions is a matter of judgment.</p>
      </article>
    {/snippet}
    {@render variant(
      v,
      v === "A"
        ? "Alert in the text: tinted box, icon, spoken label shown in bold."
        : "FAA label and rule: NOTE / CAUTION / WARNING / REFERENCE over a left rule, no fill.",
      body,
    )}
  {/each}
</Schemes>

<section>
  {@render heading(
    "7. Contrast, measured",
    "From the alerts in section 1, measured in this browser from the computed colours. Needed: text 4.5:1, icon 3:1. The dark header shares the dark page's colours.",
  )}
  <div class="overflow-x-auto rounded-lg border border-border bg-card">
    <table class="w-full text-left text-sm">
      <thead class="bg-muted text-foreground">
        <tr>
          <th class="px-3 py-2">Style</th>
          <th class="px-3 py-2">Level</th>
          {#each schemes as scheme (scheme)}
            <th class="px-3 py-2">{scheme} text</th>
            <th class="px-3 py-2">{scheme} icon</th>
          {/each}
        </tr>
      </thead>
      <tbody class="font-mono">
        {#each styles as s (s.id)}
          {#each levels as level (level)}
            <tr class="border-t border-border">
              <td class="px-3 py-1.5">{s.id} {s.style}</td>
              <td class="px-3 py-1.5">{level}</td>
              {#each schemes as scheme (scheme)}
                {@const r = results[`${s.style}/${level}/${scheme}`]}
                {#each parts as [part, min] (part)}
                  {@const m = r?.[part]}
                  <td
                    class={[
                      "px-3 py-1.5 whitespace-nowrap",
                      m && m.ratio < min && "font-bold text-destructive",
                    ]}
                    title={m ? `${m.fg} on ${m.bg}` : ""}
                  >
                    {m
                      ? `${m.ratio.toFixed(2)}${m.ratio < min ? " ✗" : ""}`
                      : "…"}
                  </td>
                {/each}
              {/each}
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </div>
</section>
