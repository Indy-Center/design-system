---
title: TimeZoneLine
description: The line above a list of times, naming their zone, with a way to Zulu and back.
---

## Checklist

- [ ] Put it once above each list of times: events, sessions, bookings.
      Not above a single time in a sentence.
- [ ] Wire the root layout first (`readTimeZone` and `setTimeZone`, see
      the time zone's page).
- [ ] Don't write your own "Times in…" text, or a Zulu switch beside it.
- [ ] Don't change its wording or colours. `class` is for layout only.

## Use

```svelte
<script>
  import { Time, TimeZoneLine } from "@indy-center/svelte";
</script>

<TimeZoneLine class="mb-2" />
<ul>
  {#each events as event (event.id)}
    <li>
      {event.title}
      <Time value={event.start} end={event.end} show="datetime" zone="both" />
    </li>
  {/each}
</ul>
```

## Props

| Prop    | Type             | Notes                                             |
| ------- | ---------------- | ------------------------------------------------- |
| `class` | `string`         | Added to the `<p>`. Layout only.                  |
| others  | `<p>` attributes | `id`, `aria-*` and the rest, passed to the `<p>`. |

## What it shows

- In a local zone: "Times in Chicago time (CDT) · Show times in Zulu".
  The button saves Zulu.
- In Zulu: "Times are in Zulu · Show them in Indianapolis time?", with
  the device's city. The button saves "Use my device's time zone".
- With nothing saved, the server draws "Times are in Zulu", as it draws
  the times; once the page loads it names the device's zone.
- A choice applies at once to every `Time` on the page, and goes to a
  signed-in member's profile, as `TimeZoneSetting`'s do.

## Looks

The text in `muted-foreground`, at small size; the button in `link`,
underlined, thicker on hover, with a `ring` outline on focus. The line
is at least 44px tall.

## Accessibility

A `<p>` holding a native `<button>`, so the button is reached with Tab
and pressed with Enter or Space. Its name says what it does ("Show times
in Zulu").
