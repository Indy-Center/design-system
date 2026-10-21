---
title: DateTimeInput
description: A date and time box that takes the member's local time and gives the page UTC, reading it back in both zones.
---

## Checklist

- [ ] Use it for an instant a member sets: an event's start, a session,
      a training record's time. For a date alone or a time of day alone,
      use `Input` with `type="date"` or `type="time"`.
- [ ] Put it in a `Field`, which gives it its label, hint and error. Used
      alone, give it an `aria-label`.
- [ ] Give and take `value` in UTC, as an ISO string: store it as it
      comes. Don't convert it to or from a zone yourself.
- [ ] Give `name` to send the value with a form; it goes in UTC, from a
      hidden input. Give `min` and `max` in UTC too.
- [ ] Don't write your own "in UTC" note or read-out: the one under the
      box says the member's zone, then the value in local time and Zulu.
- [ ] Don't colour it. `class` is for layout only, on the wrapper round
      the box and its read-out.

## Use

```svelte
<script>
  import { DateTimeInput, Field } from "@indy-center/svelte";

  let { data } = $props();
  let start = $state(data.event.start); // "2026-10-27T23:00:00.000Z"
</script>

<Field label="Start" hint="When the event opens." required>
  {#snippet children(control)}
    <DateTimeInput {...control} name="start" bind:value={start} />
  {/snippet}
</Field>
```

Under the box, for a member in Indianapolis:

```
Local: Tue 27 Oct, 7:00 PM EDT    Zulu: Tue 27 Oct, 2300Z
```

## Props

| Prop    | Type                 | Notes                                                                                                                            |
| ------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `value` | `string`             | Bindable: `bind:value`. The instant as an ISO string in UTC (`2026-10-27T23:00:00.000Z`); undefined while the box is empty.      |
| `name`  | `string`             | Sends the value, in UTC, with a form, from a hidden input, which also takes `form` and `disabled`. The box itself sends nothing. |
| `min`   | `string`             | The earliest instant allowed, as an ISO string in UTC; the box gets it in local time.                                            |
| `max`   | `string`             | The latest instant allowed, as an ISO string in UTC.                                                                             |
| `class` | `string`             | Added to the wrapper round the box and its read-out. Layout only.                                                                |
| others  | `<input>` attributes | Passed to the box: `id`, `required`, `disabled`, `aria-*` and the rest. Your `aria-describedby` follows the read-out's id.       |

## What it shows

- The box is the browser's own `datetime-local` picker, in the member's
  zone. The browser decides how it writes the date (`10/27/2026, 07:00
PM` in US English).
- While it's empty, the read-out names the member's zone: "In your time
  zone, America/Indianapolis."
- With a value, it reads it back with `Time`: local with the zone's
  abbreviation, then Zulu, each with its own day, so an evening event
  that is the next day in Zulu says so (`Local: Tue 27 Oct, 9:00 PM EDT`,
  `Zulu: Wed 28 Oct, 0100Z`). Within the coming week, the days are
  "Today", "Tomorrow" or the weekday, as `Time` writes them.
- A time the clocks skip (2:30 AM as summer time starts) is moved on by
  the browser; the box and read-out show where it landed (3:30 AM). A
  time the clocks pass twice (1:30 AM as summer time ends) is the first
  of the two, in summer time; the read-out's Zulu shows which.
- It works to the minute: seconds aren't kept.

## Server and browser

The server can't know the member's zone, so it draws the box and the
read-out empty rather than show Zulu as local time. The hidden input
carries the value from the start. Once the page loads, the box fills in
the member's local time. Without JavaScript the box stays empty and an
edit isn't sent: the form sends the value it was drawn with.

## Looks

- The box is `Input`'s: fill `muted`, border `input`, text `foreground`,
  a `ring` outline when focused, a `destructive` border when invalid,
  44px tall at least.
- The read-out is small text in `muted-foreground`, under the box and
  above `Field`'s hint and error.

## Accessibility

- It renders a native `<input type="datetime-local">`, so its keyboard
  and picker come from the browser.
- Its name comes from `Field`'s label, or your `aria-label`.
- The read-out describes the box (`aria-describedby`), before `Field`'s
  hint and error, so a screen reader reads the value in both zones with
  the field. It isn't a live region: it's read again when the member
  comes back to the box, not on each change.
- Screen readers read Zulu as digits and "Z"; the "Zulu:" label before
  it says which zone it is.
