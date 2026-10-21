---
title: TimeZoneSetting
description: The member's time-zone choice, Zulu, their device's zone or another, saved and applied at once.
---

## Checklist

- [ ] Put it in the user menu and on the app's Settings page: the same
      control in both.
- [ ] Wire the root layout first (`readTimeZone` and `setTimeZone`, see
      the time zone's page), so the server draws the choice and a
      signed-in member's goes to their profile.
- [ ] Don't add a Save button or a confirmation: a choice applies at
      once, and the note behind "What's saved?" says what is kept.
- [ ] Don't change its wording, colours or sizes. `class` is for layout
      only.

## Use

```svelte
<script>
  import { TimeZoneSetting } from "@indy-center/svelte";
</script>

<TimeZoneSetting />
```

## Props

| Prop    | Type                    | Notes                                                    |
| ------- | ----------------------- | -------------------------------------------------------- |
| `class` | `string`                | Added to the `<fieldset>`. Layout only.                  |
| others  | `<fieldset>` attributes | `id`, `aria-*` and the rest, passed to the `<fieldset>`. |

## What it shows

Three rows, one always ticked:

- **Zulu**: every time in Zulu. Saved as `zulu`.
- **Use my device's time zone**, with the device's city and abbreviation
  beneath ("Indianapolis (EDT)"). Ticked when nothing is saved. Saved as
  `device:<zone>`, so the server draws the zone and the browser follows
  the device after travel.
- **Another time zone**, which opens a picker of every zone, grouped by
  region and named by city ("Chicago (CDT)"). Picking one saves it, and
  the row shows it beneath.

Under them, "What's saved?" opens the note: "Saved on this browser for a
year, across flyindycenter.com, and to your Indy Center profile for every
browser you sign in on." When the layout gave no `saveToProfile`, the
note leaves the profile out.

## Looks

- The legend and rows in `foreground-soft`; the ticked row in
  `foreground`, semibold, on a `muted` fill, with a tick.
- The line beneath a row, and the note, in `muted-foreground`.
- A `ring` outline on focus. Every row is at least 44px tall.

## Accessibility

- A `<fieldset>` named by its legend, "Time zone". Each row is a
  `<button aria-pressed>`, named by its choice alone and described by the
  line beneath.
- "Another time zone" also carries `aria-expanded` for the picker, a
  native `<select>` named "Pick a time zone", which takes focus when it
  opens.
- "What's saved?" is a `<button aria-expanded>` for the note.
- Until the page has loaded in the browser, the device's city is blank
  and the picker lists only the saved zone.
