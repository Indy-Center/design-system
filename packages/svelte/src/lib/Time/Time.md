---
title: Time
description: A time, date, range or relative time as a <time datetime>, in the member's own zone with Zulu beside it on request.
---

## Checklist

- [ ] Use `Time` for every time a page shows: no `toLocaleString`, date
      library format strings or hand-written `Z`.
- [ ] Pass the instant as it is stored, in UTC: a `Date`, an ISO string
      or milliseconds. Don't convert it to a zone first.
- [ ] Add `zone="both"` where members match times to what controllers say:
      events, sessions, bookings. Use `zone="zulu"` only where Zulu alone
      is the rule, such as a training report's times.
- [ ] Add `show="datetime"` when the day isn't clear from the page, and
      pass `end` for a range rather than writing two `Time`s with a dash.
- [ ] Write any label yourself: "Online" before a relative time, "ago"
      after one, "Starts" before an event. `Time` shows only the time.
- [ ] Don't colour it or set its font: it takes the text around it.
      `class` is for layout only.

## Use

```svelte
<script>
  import { Time } from "@indy-center/svelte";
</script>

<!-- 7:00 PM EDT -->
<Time value={event.start} />

<!-- Today, 7:00 PM–10:00 PM EDT · 2300Z–0200Z -->
<Time value={event.start} end={event.end} show="datetime" zone="both" />

<!-- Online 1 h 23 m -->
<p>Online <Time value={controller.loginTime} show="relative" /></p>
```

## Props

| Prop    | Type                                 | Notes                                                                                                                          |
| ------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `value` | `Date \| string \| number`           | Required. The instant: a `Date`, an ISO string or milliseconds since the epoch.                                                |
| `end`   | `Date \| string \| number`           | A range's end.                                                                                                                 |
| `zone`  | `"local" \| "zulu" \| "both"`        | `"local"` by default. `"both"` is local, then Zulu: `7:00 PM EDT · 2300Z`.                                                     |
| `show`  | `"time" \| "datetime" \| "relative"` | `"time"` by default. `"datetime"` puts the day first; `"relative"` gives "in 2 h" or "1 h 23 m", and ignores `end` and `zone`. |
| `class` | `string`                             | Layout only.                                                                                                                   |
| others  | global attributes                    | `id`, `aria-*` and the rest, passed to the root: the `<time>`, or a range's `<span>`. `Time` sets `datetime` itself.           |

## What it shows

Times, with the clock pinned at 5:00 PM EDT on Tuesday 20 October 2026:

| Props                                   | Shows                                       |
| --------------------------------------- | ------------------------------------------- |
| default                                 | `7:00 PM EDT`                               |
| `zone="both"`                           | `7:00 PM EDT · 2300Z`                       |
| `zone="zulu"`                           | `2300Z`                                     |
| `show="datetime"`, today                | `Today, 7:00 PM EDT`                        |
| `show="datetime"`, tomorrow             | `Tomorrow, 7:00 PM EDT`                     |
| `show="datetime"`, within the week      | `Thursday, 7:00 PM EDT`                     |
| `show="datetime"`, a week out or past   | `Tue 27 Oct, 7:00 PM EDT`                   |
| `show="datetime"`, another year         | `Thu 4 Mar 2027, 6:00 PM EST`               |
| `end`, `show="datetime"`, `zone="both"` | `Today, 7:00 PM–10:00 PM EDT · 2300Z–0200Z` |
| `end` on the next day                   | `Today, 7:00 PM–Tomorrow, 1:00 AM EDT`      |
| `show="relative"`, to come              | `in 2 h`                                    |
| `show="relative"`, gone by              | `1 h 23 m`                                  |

- Zulu is always four digits and a `Z`. Local is the 12-hour clock with
  the zone's abbreviation; a zone without one shows its offset (`GMT+1`).
- The day is the member's day, not Zulu's: 0200Z on the 21st is "Today"
  at 10:00 PM EDT on the 20th.
- A relative time counts on each minute. It uses the short units of
  `formatDuration`.

## Server and browser

The server can't know the member's zone, so it draws Zulu, whatever zone
the server runs in: `zone="both"` is `2300Z` alone until then. Once the
page loads, the browser redraws in its own zone. A Worker in UTC never
shows a wrong "local" time; a member sees Zulu for a moment before local.
A saved time zone, which will let the server draw local from the start,
is still to come.

## Looks

No colours or fonts of its own: it takes the colour and font of the text
around it in every scheme.

## Accessibility

- A single time renders `<time datetime>`, with the instant in UTC
  (`2026-10-20T23:00:00.000Z`). A range is a `<span>` holding a
  `<time datetime>` for each end, in each zone shown.
- A relative time's `datetime` is the instant it counts from or to.
- Screen readers read Zulu as digits and "Z". Write "Zulu" in a nearby
  label where that matters.
