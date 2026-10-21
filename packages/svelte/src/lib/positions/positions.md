---
title: Positions lookup
description: Fetches an ARTCC's positions from vNAS on the server, and hands them to every Position and Frequency on the page.
---

## Checklist

- [ ] Fetch the positions once, in the root `+layout.server.ts`, with
      `fetchPositions("ZID")` from `@indy-center/svelte/server`. Never in a
      component or the browser: Data Admin sends no CORS header.
- [ ] Set them once, in the root `+layout.svelte`, with
      `setPositions(() => data.positions)`. Pass a function, not the array,
      so lookups follow when the layout's data reloads.
- [ ] Then write `<Position callsign="IND_83_CTR" />` with the callsign
      alone, as many times as the page needs. A `radioName` or `frequency`
      prop still wins over the lookup.
- [ ] Don't fetch Data Admin yourself, and don't add your own cache:
      `fetchPositions` already shares one copy per server process.
- [ ] Don't wrap it in `try`: it never rejects. When vNAS is down it gives
      the copy it has, or no positions, and components show the callsign
      alone.

## Use

`src/routes/+layout.server.ts`:

```ts
import { fetchPositions } from "@indy-center/svelte/server";

export const load = async () => ({
  positions: await fetchPositions("ZID"),
});
```

`src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import { setPositions } from "@indy-center/svelte";

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
helpers' `resolvePosition`) and shows "Indy Center" and its frequency.

In your own component, read them with `getPositions()`, which returns a
function, and call it where you use them:

```svelte
<script lang="ts">
  import { getPositions, resolvePosition } from "@indy-center/svelte";

  let { callsign }: { callsign: string } = $props();
  const positions = getPositions();
  const found = $derived(resolvePosition(callsign, positions()));
</script>
```

## Functions

| Function                        | Where        | Notes                                                                                               |
| ------------------------------- | ------------ | --------------------------------------------------------------------------------------------------- |
| `fetchPositions(artcc)`         | `/server`    | `Promise<VnasPosition[]>`: the ARTCC's positions, its TRACONs' and towers' included. Never rejects. |
| `setPositions(() => positions)` | package root | In the root layout's `<script>`, once.                                                              |
| `getPositions()`                | package root | `() => readonly VnasPosition[]`; no positions when no layout set them.                              |

`@indy-center/svelte/server` throws if it is loaded in the browser, so a
stray import from a component fails at once rather than at the fetch.

## How it fetches

- One `GET https://data-api.vnas.vatsim.net/api/artccs/ZID`: about 1 MB,
  slimmed to `VnasPosition` (about 26 KB for ZID's 157 positions), the
  rest dropped. `facility` is the name of the ARTCC, TRACON or tower the
  position belongs to; `radioName` has its spaces collapsed.
- The copy is kept in memory, per server process (per Worker isolate on
  Cloudflare), and shared by every request and every caller. Callers at
  the same moment share one request.
- After an hour it asks again. If Data Admin's `lastUpdatedAt` is
  unchanged, it keeps the same array. Data Admin sends no `ETag` or
  caching headers, so a check costs the full 1 MB; it changes every few
  days.
- When the request fails, answers with an error, or isn't an ARTCC, it
  logs the error with `console.error`, gives the copy it has (or `[]`),
  and asks again after a minute.

## Planned

The fetch will move to identity, as `getFacilityPositions()` over RPC, so
apps stop each pulling the 1 MB. When it does, only the
`+layout.server.ts` line changes; `setPositions` and the components stay.

## Accessibility

None of its own: it renders nothing. How a position reads is
`Position`'s and `Frequency`'s job.
