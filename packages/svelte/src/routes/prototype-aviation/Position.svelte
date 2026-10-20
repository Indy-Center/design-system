<script lang="ts" module>
  export type Field = "callsign" | "radioName" | "name" | "frequency";
  export const FIELDS: { key: Field; label: string }[] = [
    { key: "radioName", label: "Radio name" },
    { key: "name", label: "Sector name" },
    { key: "frequency", label: "Frequency" },
    { key: "callsign", label: "Callsign (vNAS short name later)" },
  ];
</script>

<script lang="ts">
  // Round 2: a Position that shows any subset of its fields. The first text
  // field leads; the rest follow, muted. Frequency sits at the end (inline)
  // or on the right of the first line (stacked).
  import {
    formatFrequency,
    resolvePosition,
    spokenFrequency,
  } from "./helpers.ts";

  let {
    login,
    show,
    layout = "stacked",
  }: { login: string; show: Field[]; layout?: "inline" | "stacked" } = $props();

  const r = $derived(resolvePosition(login));
  const order: Field[] = ["radioName", "name", "callsign"];
  const texts = $derived.by(() => {
    // An unknown callsign has nothing else to show, so it shows alone.
    if (r.kind === "unknown")
      return [{ field: "callsign" as Field, text: login }];
    const p = r.position;
    const out = order
      .filter((f) => show.includes(f))
      .map((f) => ({
        field: f,
        text: f === "callsign" ? r.login : f === "name" ? p.name : p.radioName,
      }));
    return out;
  });
  const hz = $derived(
    r.kind !== "unknown" && show.includes("frequency")
      ? r.position.frequency
      : undefined,
  );
  const lead = $derived(texts[0]);
  const rest = $derived(texts.slice(1));
  const mono = (f: Field) => (f === "callsign" ? "font-mono" : "");
</script>

{#snippet freq(hz: number)}
  <span class="font-mono text-foreground tabular-nums"
    >{formatFrequency(hz)}<span class="sr-only">
      ({spokenFrequency(hz)})</span
    ></span
  >
{/snippet}

{#if layout === "inline"}
  <span>
    {#if lead}<span class={["font-semibold text-foreground", mono(lead.field)]}
        >{lead.text}</span
      >{/if}
    {#each rest as t (t.field)}
      <span class="text-muted-foreground">
        · <span class={mono(t.field)}>{t.text}</span></span
      >
    {/each}
    {#if hz}{#if lead}<span class="text-muted-foreground">
          ·
        </span>{/if}{@render freq(hz)}{/if}
    {#if r.kind === "relief" && show.includes("callsign")}
      <span class="text-sm text-muted-foreground">(relief)</span>
    {/if}
  </span>
{:else}
  <span class="block">
    <span class="flex items-baseline justify-between gap-3">
      {#if lead}<span
          class={["font-semibold text-foreground", mono(lead.field)]}
          >{lead.text}</span
        >{/if}
      {#if hz}{@render freq(hz)}{/if}
    </span>
    {#if rest.length}
      <span class="block text-sm text-muted-foreground">
        {#each rest as t, i (t.field)}{i ? " · " : ""}<span
            class={mono(t.field)}>{t.text}</span
          >{/each}
      </span>
    {/if}
    {#if r.kind === "relief" && show.includes("callsign")}
      <span class="block text-sm text-muted-foreground"
        >relief of <span class="font-mono">{r.position.callsign}</span></span
      >
    {/if}
  </span>
{/if}
