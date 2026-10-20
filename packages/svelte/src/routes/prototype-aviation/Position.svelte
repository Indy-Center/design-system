<script lang="ts" module>
  export type Field =
    "callsign" | "airport" | "radioName" | "name" | "frequency";
  export const FIELDS: { key: Field; label: string }[] = [
    { key: "callsign", label: "Callsign (vNAS short name later)" },
    { key: "airport", label: "Airport" },
    { key: "radioName", label: "Radio name" },
    { key: "name", label: "Sector name" },
    { key: "frequency", label: "Frequency" },
  ];
</script>

<script lang="ts">
  // Round 3: a Position that shows any subset of its fields. Codes (the short
  // name, the airport) sit in a column on the left; the radio name leads, the
  // sector follows muted; the frequency sits right of the first line (stacked)
  // or at the end (one line). A relief login shows as the position it
  // resolves to, with no note: it may not be a relief at all.
  import {
    airportOf,
    formatFrequency,
    resolvePosition,
    spokenFrequency,
  } from "./helpers.ts";

  let {
    login,
    show,
    layout = "stacked",
    airportAt = "left",
    decimals = 2,
  }: {
    login: string;
    show: Field[];
    layout?: "inline" | "stacked";
    airportAt?: "left" | "under";
    decimals?: 2 | 3;
  } = $props();

  const r = $derived(resolvePosition(login));
  const has = (f: Field) => show.includes(f);
  const airport = $derived(
    r.kind !== "unknown" && has("airport") ? airportOf(r.login) : undefined,
  );
  const texts = $derived(
    r.kind === "unknown"
      ? []
      : [
          has("radioName") ? r.position.radioName : "",
          has("name") ? r.position.name : "",
        ].filter(Boolean),
  );
  // With no words to lead, a code leads instead; an unknown callsign has
  // nothing else to show, so it shows alone.
  const codeLeads = $derived(r.kind === "unknown" || texts.length === 0);
  const codes = $derived(
    [
      has("callsign") || r.kind === "unknown" ? login : "",
      airport && (airportAt === "left" || codeLeads) ? airport.icao : "",
    ].filter(Boolean),
  );
  const under = $derived(
    airport && airportAt === "under" && !codeLeads ? airport : undefined,
  );
  const hz = $derived(
    r.kind !== "unknown" && has("frequency") ? r.position.frequency : undefined,
  );
</script>

{#snippet freq(hz: number)}
  <span class="font-mono text-foreground tabular-nums"
    >{formatFrequency(hz, decimals)}<span class="sr-only">
      ({spokenFrequency(hz)})</span
    ></span
  >
{/snippet}

{#if layout === "inline"}
  <span>
    {#if codes.length}<span
        class={[
          "font-mono",
          codeLeads ? "font-semibold text-foreground" : "text-foreground-soft",
        ]}>{codes.join(" ")}</span
      >{/if}
    {#each texts as t, i (t)}
      <span
        class={i ? "text-muted-foreground" : "font-semibold text-foreground"}
        >{i || codes.length ? " · " : ""}{t}</span
      >
    {/each}
    {#if under}<span class="text-muted-foreground">
        · <span class="font-mono">{under.icao}</span></span
      >{/if}
    {#if hz}{#if codes.length || texts.length}<span
          class="text-muted-foreground">{" · "}</span
        >{/if}{@render freq(hz)}{/if}
  </span>
{:else}
  <span class="flex items-baseline gap-3">
    {#if !codeLeads && (has("callsign") || (has("airport") && airportAt === "left"))}
      <!-- Kept even when empty, so rows in a list line up. -->
      <span
        class={[
          "shrink-0 font-mono text-sm text-foreground-soft",
          has("callsign") ? "w-[11ch]" : "w-[4ch]",
        ]}>{codes.join(" ")}</span
      >
    {/if}
    <span class="block min-w-0 flex-1">
      <span class="flex items-baseline justify-between gap-3">
        {#if codeLeads}
          <span class="font-mono font-semibold text-foreground"
            >{codes.join(" ")}</span
          >
        {:else}
          <span class="font-semibold text-foreground">{texts[0]}</span>
        {/if}
        {#if hz}{@render freq(hz)}{/if}
      </span>
      {#if texts[1] || under}
        <span class="block text-sm text-muted-foreground">
          {#if texts[1]}{texts[1]}{/if}{#if texts[1] && under}{" · "}{/if}{#if under}<span
              class="font-mono">{under.icao}</span
            >
            {under.name}{/if}
        </span>
      {/if}
    </span>
  </span>
{/if}
