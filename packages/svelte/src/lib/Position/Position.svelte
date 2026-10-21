<script lang="ts" module>
  /** A part of a position that `Position` can show. */
  export type PositionField =
    "shortName" | "airport" | "radioName" | "name" | "frequency";
</script>

<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import { resolvePosition } from "../aviation/resolvePosition.js";
  import Frequency from "../Frequency/Frequency.svelte";
  import { toHertz } from "../Frequency/hertz.js";
  import { getPositions } from "../positions/positionsContext.js";

  type Props = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
    /** The callsign logged in, a relief login included: `IND_831_CTR`. */
    callsign: string;
    /** The vNAS position id, from the vNAS feed: matched instead of the callsign. */
    positionId?: string;
    /** What to show, in any order. The controllers' preset by default. */
    show?: readonly PositionField[];
    /** `"stacked"` (the default): two lines. `"inline"`: one. */
    layout?: "stacked" | "inline";
    /** Where the airport goes: `"right"` of the radio name (the default), a `"left"` column, or `"under"`. */
    airportAt?: "right" | "left" | "under";
    /** The airport's code, `"KLEX"`: a cab position's, or an approach's primary one. */
    airport?: string;
    /** The airport's name, shown with `airportAt="under"`. */
    airportName?: string;
    /** Wins over the radio name the positions give. */
    radioName?: string;
    /** Wins over the frequency the positions give: hertz, or megahertz as written. */
    frequency?: number | string;
    /** The frequency's decimals, passed to `Frequency`. */
    decimals?: 2 | 3;
  };

  let {
    callsign,
    positionId,
    show = ["shortName", "radioName", "name", "frequency"],
    layout = "stacked",
    airportAt = "right",
    airport,
    airportName,
    radioName,
    frequency,
    decimals = 2,
    class: className,
    ...rest
  }: Props = $props();

  const positions = getPositions();
  const found = $derived(
    resolvePosition(callsign, positions(), { positionId })?.position,
  );
  const has = (field: PositionField) => show.includes(field);

  // A frequency prop that isn't one is ignored.
  const givenHz = $derived(
    frequency === undefined ? undefined : toHertz(frequency),
  );
  const radioText = $derived(radioName ?? found?.radioName);

  // Known when the positions have it, or the props say enough to show.
  const known = $derived(
    found !== undefined || radioName !== undefined || givenHz !== undefined,
  );

  /** A text part of the label, in mono for a callsign. */
  type Part = { text: string; mono?: boolean };

  const shortName = $derived<Part | undefined>(
    has("shortName")
      ? // vNAS has no short name yet: the position's own callsign.
        { text: found?.callsign ?? callsign, mono: true }
      : undefined,
  );
  const radio = $derived<Part | undefined>(
    has("radioName") && radioText ? { text: radioText } : undefined,
  );
  const sector = $derived<Part | undefined>(
    has("name") && found?.name ? { text: found.name } : undefined,
  );
  const hz = $derived(
    has("frequency") ? (givenHz ?? found?.frequency) : undefined,
  );
  const code = $derived(has("airport") ? airport : undefined);

  // The radio name leads; without it the sector, then the short name.
  const lead = $derived(radio ?? sector ?? shortName);
  const others = $derived(
    [shortName, sector].filter((p): p is Part => p !== undefined && p !== lead),
  );
  // With nothing else to lead, the airport leads, wherever it was asked for;
  // otherwise it goes where airportAt says.
  const airportLeads = $derived(lead === undefined && code !== undefined);
  const where = $derived(airportLeads ? undefined : airportAt);
</script>

{#snippet dot()}{" "}<span aria-hidden="true">·</span>{" "}{/snippet}

{#snippet text(p: Part)}<span class={{ "font-mono": p.mono }}>{p.text}</span
  >{/snippet}

{#snippet leading()}
  <span class="font-semibold text-foreground"
    >{#if lead}{@render text(lead)}{:else if airportLeads}<span
        class="font-mono">{code}</span
      >{/if}{#if code && where === "right"}<span
        class="font-normal text-muted-foreground"
        >{@render dot()}<span class="font-mono text-sm">{code}</span></span
      >{/if}</span
  >
{/snippet}

{#snippet under()}<span class="font-mono">{code}</span
  >{#if airportName}{" "}{airportName}{/if}{/snippet}

{#if !known}
  <span {...rest} class={["font-mono", className]}>{callsign}</span>
{:else if layout === "inline"}
  <span {...rest} class={className}>
    {#if code && where === "left"}<span class="font-mono text-foreground-soft"
        >{code}</span
      >{" "}{/if}{@render leading()}{#each others as p, i (i)}<span
        class="text-muted-foreground">{@render dot()}{@render text(p)}</span
      >{/each}{#if code && where === "under"}<span class="text-muted-foreground"
        >{@render dot()}{@render under()}</span
      >{/if}{#if hz !== undefined}{#if lead || airportLeads}<span
          class="text-muted-foreground">{@render dot()}</span
        >{/if}<Frequency value={hz} {decimals} class="text-foreground" />{/if}
  </span>
{:else}
  <span {...rest} class={["flex items-baseline gap-3", className]}>
    {#if where === "left" && has("airport")}
      <!-- Kept without an airport, so rows in a list line up. -->
      <span class="w-[4ch] shrink-0 font-mono text-sm text-foreground-soft"
        >{code ?? ""}</span
      >{" "}
    {/if}
    <span class="block min-w-0 flex-1">
      <span class="flex items-baseline justify-between gap-3">
        {@render leading()}{" "}
        {#if hz !== undefined}<Frequency
            value={hz}
            {decimals}
            class="text-foreground"
          />{/if}
      </span>{" "}
      {#if others.length || (code && where === "under")}
        <span class="block text-sm text-muted-foreground"
          >{#each others as p, i (i)}{#if i}{@render dot()}{/if}{@render text(
              p,
            )}{/each}{#if code && where === "under"}{#if others.length}{@render dot()}{/if}{@render under()}{/if}</span
        >
      {/if}
    </span>
  </span>
{/if}
