<script module lang="ts">
  // The package's own block snippets, by slug. Each block the package
  // draws adds its snippet below and a line here, alphabetical; the type
  // asks for one per slug in `BlockFieldTypes` (../blocks.ts). An app's
  // snippet for the same slug replaces it.
  import type { Snippet } from "svelte";
  import type {
    AirportBlock,
    BlockFieldTypes,
    BlockSlug,
    FlightCategoryBlock,
    FrequencyBlock,
    PositionBlock,
    RatingBlock,
    TimeBlock,
  } from "../blocks.js";
  import Airport from "../Airport/Airport.svelte";
  import FlightCategory from "../FlightCategory/FlightCategory.svelte";
  import Frequency from "../Frequency/Frequency.svelte";
  import Position from "../Position/Position.svelte";
  import Rating from "../Rating/Rating.svelte";
  import Time from "../Time/Time.svelte";
  import type { BlockProps } from "./blockSnippets.js";

  export const PACKAGE_BLOCKS: {
    [Slug in BlockSlug]: Snippet<[BlockProps<BlockFieldTypes[Slug]>]>;
  } = {
    // One line per block, alphabetical: `callout,`
    airport,
    flightCategory,
    frequency,
    position,
    rating,
    time,
  };
</script>

<!--
  One snippet per block, alphabetical, drawing its component:
  {#snippet callout({ content, ...fields }: BlockProps<CalloutBlock>)}
    <Callout {...fields}>{@render content()}</Callout>
  {/snippet}
-->

{#snippet airport(fields: BlockProps<AirportBlock>)}
  <Airport {...fields} />
{/snippet}

{#snippet flightCategory(fields: BlockProps<FlightCategoryBlock>)}
  <FlightCategory {...fields} />
{/snippet}

<!-- A blank value is no value, so the callsign is used. -->
{#snippet frequency({ value, callsign }: BlockProps<FrequencyBlock>)}
  <Frequency value={value || undefined} callsign={callsign || undefined} />
{/snippet}

<!-- Inline in a sentence; a position with no airport code has no airport. -->
{#snippet position({ airport, ...fields }: BlockProps<PositionBlock>)}
  <Position
    {...fields}
    layout="inline"
    airport={airport?.code
      ? { code: airport.code, name: airport.name || undefined }
      : undefined}
  />
{/snippet}

{#snippet rating(fields: BlockProps<RatingBlock>)}
  <Rating {...fields} />
{/snippet}

{#snippet time(fields: BlockProps<TimeBlock>)}
  <Time {...fields} show="daily" />
{/snippet}
