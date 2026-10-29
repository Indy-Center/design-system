---
title: OnlineController
description: The "who's on" row: a position, who is on it and for how long, and when they log out, if known.
---

## Checklist

- [ ] Use it for each staffed position in a list of who's online. Don't
      build the row from `Position`, `Member` and `Time` yourself.
- [ ] Fetch the feed in your app; the row only shows what it is given.
      The page's positions must be set, as for `Position` (see the
      positions lookup's page).
- [ ] Group the feed's logins with `groupByPosition` first, so a relief
      login joins the person on the position it covers: one row per
      position, its people stacked.
- [ ] Pass `positionId` (the vNAS feed's `primaryPositionId`) when you
      have it.
- [ ] Pass each person's controller info as the feed gives it, and their
      booking's end once bookings run. The row works out the log-out time.
- [ ] Leave the CID off unless the page needs it. There is no rating.
- [ ] Put the rows in a list, with your own spacing between them.

## Use

```svelte
<script>
  import {
    groupByPosition,
    OnlineController,
  } from "@indy-center/centerline-svelte";

  let { data } = $props();
  // data.online: [{ callsign, positionId, name, cid, loggedInAt, info }]
  const groups = $derived(groupByPosition(data.online, data.positions));
</script>

<ul class="divide-y divide-border">
  {#each groups as group (group.callsign)}
    <li class="py-2.5">
      <OnlineController
        callsign={group.callsign}
        positionId={group.position?.id}
        members={group.logins}
      />
    </li>
  {/each}
</ul>
```

## Props

| Prop         | Type              | Notes                                                                                                  |
| ------------ | ----------------- | ------------------------------------------------------------------------------------------------------ |
| `callsign`   | `string`          | Required. The callsign logged in, or the group's: a relief login shows as the position it resolves to. |
| `positionId` | `string`          | The vNAS position id, matched instead of the callsign.                                                 |
| `members`    | `OnlineMember[]`  | Required. Who is on it: one, or two in a relief, in the order to show.                                 |
| `showCid`    | `boolean`         | `false` by default. `true` shows each CID after the name, as `Member` does.                            |
| `class`      | `string`          | Layout only.                                                                                           |
| others       | global attributes | `id`, `aria-*` and the rest, on its root `<div>`.                                                      |

`OnlineMember`:

| Field        | Type                         | Notes                                                               |
| ------------ | ---------------------------- | ------------------------------------------------------------------- |
| `name`       | `string`                     | Required. As `Member` takes it; a name-private member's first name. |
| `cid`        | `number \| string`           | Required. Shown only with `showCid`.                                |
| `loggedInAt` | `Date \| string \| number`   | Required. When they logged in.                                      |
| `info`       | `string \| string[] \| null` | Their controller info, as text or VATSIM's lines (`text_atis`).     |
| `bookingEnd` | `Date \| string \| number`   | Their booking's end; wins over the info.                            |
| `href`       | `string`                     | Links the name, such as to their profile.                           |

## What it shows

With the clock at 2100Z (5:00 PM EDT), Jordan logged in at 1937Z on
IND_83_CTR, with "Off at 2330z" in their info:

```
Indy Center                       128.22
IND_83_CTR · Falmouth 83
Jordan Sample · 1 h 23 m
Online until 7:30 PM EDT · 2330Z
```

- The position is `Position` with the controllers' preset. A relief login
  shows as the position it covers, with no note; an unknown callsign
  shows alone.
- How long they've been on has no label, and counts on each minute.
- The log-out time is the booking's end when there is one, else the first
  `2330Z` in the info (see `logoffFromInfo` on the aviation helpers'
  page). With neither, there is no line.
- Two people on one position: one row, each person's lines stacked
  beneath the position.

## Server and browser

As `Time`: the times are drawn in Zulu on the server until the member's
zone is known, then local once the page loads.

## Looks

- The position as `Position` draws it.
- Each name in `foreground-soft`, then ` · 1 h 23 m` in
  `muted-foreground`, in `text-sm`.
- "Online until …" in `muted-foreground`, `text-sm`, on its own line.

## Accessibility

- A `<div>` of text, with nothing to open or press but a linked name.
- The `·` between the name and the time on is hidden from screen readers.
- The times are `<time datetime>`: the time on carries the log-in, the
  log-out its instant.
