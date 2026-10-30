---
title: Positions lookup
description: Hands the CMS catalogue's positions to every Position and Frequency on the page.
---

## Checklist

- [ ] Read the positions once, in the root `+layout.server.ts`, from the
      CMS catalogue's `positions`, with your app's own server-side CMS
      read. Centerline doesn't fetch them, and no app calls vNAS: the CMS
      copies Data Admin once a day.
- [ ] Return only the catalogue's `positions` from the load, never the
      whole catalogue: the catalogue is for servers, the positions are
      fine for the page.
- [ ] Set them once, in the root `+layout.svelte`, with
      `setPositions(() => data.positions)`. Pass a function, not the array,
      so lookups follow when the layout's data reloads. Pass the
      catalogue's positions as they are; there is nothing to map.
- [ ] Then write `<Position callsign="IND_83_CTR" />` with the callsign
      alone, as many times as the page needs. A `radioName` or `frequency`
      prop still wins over the lookup.
- [ ] When the CMS can't be read, give no positions (`[]`): components
      show the callsign alone.

## Use

`src/routes/+layout.server.ts`, where `cms` is your app's CMS client:

```ts
export const load = async ({ locals }) => ({
  positions: (await locals.cms.catalogue()).positions,
});
```

`src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import { setPositions } from "@indy-center/centerline-svelte";

  let { data, children } = $props();
  setPositions(() => data.positions);
</script>

{@render children()}
```

Any page below:

```svelte
<Position callsign="IND_831_CTR" />
```

`Position` finds `IND_83_CTR` by the relief rule (see the aviation
helpers' `resolvePosition`) and shows "Indy Center", its frequency, and
`FLM 83 · Falmouth 83`.

In your own component, read them with `getPositions()`, which returns a
function, and call it where you use them. Name your own position type to
read the fields centerline doesn't, such as `requiredCredentials`:

```svelte
<script lang="ts">
  import {
    getPositions,
    resolvePosition,
  } from "@indy-center/centerline-svelte";
  import type { CataloguePosition } from "$lib/server/cms/types";

  let { callsign }: { callsign: string } = $props();
  const positions = getPositions<CataloguePosition>();
  const found = $derived(resolvePosition(callsign, positions()));
</script>
```

## Functions

| Function                        | Where        | Notes                                                                                                    |
| ------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------- |
| `setPositions(() => positions)` | package root | In the root layout's `<script>`, once. Takes any positions with `PositionInfo`'s fields.                 |
| `getPositions<P>()`             | package root | `() => readonly P[]`, `PositionInfo` by default; no positions when no layout set them. `P` is unchecked. |

## PositionInfo

The fields centerline reads of the catalogue's positions. Any other field
the catalogue serves (`facility`, `starred`, `requiredCredentials`) is
kept on the objects and never read.

| Field       | Type             | Notes                                                                   |
| ----------- | ---------------- | ----------------------------------------------------------------------- |
| `id`        | `string`         | The vNAS id; the feed's `primaryPositionId`.                            |
| `callsign`  | `string`         | `IND_83_CTR`.                                                           |
| `name`      | `string`         | The sector or position name: "Falmouth 83".                             |
| `shortName` | `string \| null` | As controllers say it: `FLM 83`, `LEX LC`; null where the CMS has none. |
| `radioName` | `string`         | "Indy Center".                                                          |
| `frequency` | `number`         | In hertz: `128225000`.                                                  |
| `retired`   | `boolean`        | vNAS no longer lists it: a callsign never resolves to it.               |

## Accessibility

None of its own: it renders nothing. How a position reads is
`Position`'s and `Frequency`'s job.
