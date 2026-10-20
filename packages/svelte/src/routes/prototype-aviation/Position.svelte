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
  // Round 4: a Position that shows any subset of its fields. Stacked: the
  // radio name leads with the frequency on its right; beneath it the short
  // name, then the sector ("IND_83_CTR · Falmouth 83"). Without a radio name
  // the sector leads, then the short name. The airport goes in a narrow
  // left column or at the end of the second line. A relief login shows as
  // the position it resolves to: it may not be a relief at all. An unknown
  // callsign shows alone.
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
    airportAt?: "left" | "right" | "under";
    decimals?: 2 | 3;
  } = $props();

  type Part = { field: Field; text: string; mono?: boolean; sub?: string };

  const r = $derived(resolvePosition(login));
  const has = (f: Field) => show.includes(f);
  const airport = $derived(
    r.kind !== "unknown" && has("airport") ? airportOf(r.login) : undefined,
  );

  // Parts in reading order, the leading one first.
  const parts = $derived.by((): Part[] => {
    if (r.kind === "unknown")
      return [{ field: "callsign", text: login, mono: true }];
    const p = r.position;
    const short: Part | false = has("callsign") && {
      field: "callsign",
      text: r.login,
      mono: true,
    };
    const radio: Part | false = has("radioName") && {
      field: "radioName",
      text: p.radioName,
    };
    const sector: Part | false = has("name") && {
      field: "name",
      text: p.name,
    };
    const lead = radio || sector || short;
    const rest = [short, sector].filter((x): x is Part => !!x && x !== lead);
    const out = [lead, ...rest].filter((x): x is Part => !!x);
    if (airport && (airportAt === "under" || !out.length))
      out.push({
        field: "airport",
        text: airport.icao,
        mono: true,
        sub: out.length ? airport.name : "",
      });
    return out;
  });
  const lead = $derived(parts[0]);
  const rest = $derived(parts.slice(1));
  const leftColumn = $derived(
    r.kind !== "unknown" &&
      has("airport") &&
      airportAt === "left" &&
      parts.length > 0 &&
      parts[0].field !== "airport",
  );
  // "right": the code just after the leading name, on the first line.
  const besideLead = $derived(
    airport && airportAt === "right" && parts[0]?.field !== "airport"
      ? airport.icao
      : "",
  );
  const hz = $derived(
    r.kind !== "unknown" && has("frequency") ? r.position.frequency : undefined,
  );
</script>

{#snippet beside()}{#if besideLead}<span
      class="font-normal text-muted-foreground"
      >{" · "}<span
        class="relative bottom-(--airport-nudge,0.5px) font-mono text-sm"
        >{besideLead}</span
      ></span
    >{/if}{/snippet}

{#snippet freq(hz: number)}
  <span class="font-mono text-foreground tabular-nums"
    >{formatFrequency(hz, decimals)}<span class="sr-only">
      ({spokenFrequency(hz)})</span
    ></span
  >
{/snippet}

{#snippet part(p: Part)}<span class={p.mono ? "font-mono" : ""}>{p.text}</span
  >{#if p.sub}{" "}{p.sub}{/if}{/snippet}

{#if layout === "inline"}
  <span>
    {#if leftColumn && airport}<span class="font-mono text-foreground-soft"
        >{airport.icao}{" "}</span
      >{/if}
    {#each parts as p, i (p.field)}
      <span
        class={i ? "text-muted-foreground" : "font-semibold text-foreground"}
        >{i ? " · " : ""}{@render part(p)}{#if !i}{@render beside()}{/if}</span
      >
    {/each}
    {#if hz}{#if parts.length}<span class="text-muted-foreground">{" · "}</span
        >{/if}{@render freq(hz)}{/if}
  </span>
{:else}
  <span class="flex items-baseline gap-3">
    {#if leftColumn}
      <!-- Kept even when empty, so rows in a list line up. -->
      <span class="w-[4ch] shrink-0 font-mono text-sm text-foreground-soft"
        >{airport?.icao ?? ""}</span
      >
    {/if}
    <span class="block min-w-0 flex-1">
      <span class="flex items-baseline justify-between gap-3">
        {#if lead}<span class="font-semibold text-foreground"
            >{@render part(lead)}{@render beside()}</span
          >{/if}
        {#if hz}{@render freq(hz)}{/if}
      </span>
      {#if rest.length}
        <span class="block text-sm text-muted-foreground">
          {#each rest as p, i (p.field)}{i ? " · " : ""}{@render part(p)}{/each}
        </span>
      {/if}
    </span>
  </span>
{/if}
