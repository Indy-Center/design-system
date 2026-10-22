---
title: FlightCategory
description: A flight category, VFR, MVFR, IFR or LIFR, as a small badge in the FAA's colours, with the long name in a tooltip.
---

## Checklist

- [ ] Use it wherever a page shows an airport's flight category, such as a
      weather row. Don't colour the word yourself.
- [ ] Pass the category your app worked out from the METAR. `FlightCategory`
      doesn't read METARs; the parser stays in the app.
- [ ] Show nothing when the category isn't known: leave the component out
      rather than passing a guess.
- [ ] Add `focusable` where a page has only a few (one airport's weather),
      so a keyboard can reach the long name. Leave it off in a table of
      airports, which would get a tab stop per row. Screen readers read
      the long name either way.
- [ ] Don't change its colours or size. `class` is for layout only.

## Use

```svelte
<script>
  import { FlightCategory } from "@indy-center/svelte";
</script>

<!-- category: worked out from the METAR by the app -->
<FlightCategory {category} />
```

## Props

| Prop        | Type                                 | Notes                                                                 |
| ----------- | ------------------------------------ | --------------------------------------------------------------------- |
| `category`  | `"VFR" \| "MVFR" \| "IFR" \| "LIFR"` | Required. Anything else shows nothing, with a warning in development. |
| `focusable` | `boolean`                            | Makes it a tab stop. `false` by default.                              |
| `class`     | `string`                             | Added to the `Tooltip` box round the badge. Layout only.              |
| others      | `<span>` attributes                  | Passed to the badge's `<span>`.                                       |

`FLIGHT_CATEGORIES` lists the four, best weather first, and
`FlightCategoryCode` is their type.

## Looks

12px semibold text in a small rounded badge, on the FAA's colours as the
roles hold them:

| Category | Long name                    | Fill                 | Text                                          |
| -------- | ---------------------------- | -------------------- | --------------------------------------------- |
| `VFR`    | Visual flight rules          | `success` at 15%     | `success`, a quarter towards `foreground`     |
| `MVFR`   | Marginal visual flight rules | `info` at 15%        | `info`, a quarter towards `foreground`        |
| `IFR`    | Instrument flight rules      | `destructive` at 15% | `destructive`, a quarter towards `foreground` |
| `LIFR`   | Low instrument flight rules  | `destructive`, solid | `card`                                        |

LIFR is IFR's red, filled: no colour of its own. The tinted text is mixed
a quarter of the way to `foreground` (darker in light, lighter in dark),
because in the role alone VFR in light and IFR on a dark card fall short
of 4.5:1. Every category passes 4.5:1 on the page and on a card in every
scheme.

The long name shows in a `Tooltip` above the badge while a mouse is on
it, and on keyboard focus when `focusable`, with a `ring` outline round
the badge. A tap on a phone shows no tooltip.

## Accessibility

- An `<abbr>` inside the badge's `<span>`, holding the category and,
  after it, the long name in visually hidden text, so a screen reader
  reads "MVFR Marginal visual flight rules", with or without `focusable`.
- The long name is read once: the `<abbr>` has no `title`, and the
  tooltip is `aria-hidden`.
- The word is always shown, so the colour is never the only cue.
- With `focusable`, the `<abbr>` takes focus so a keyboard user can show
  the tooltip; Escape hides it. It isn't a control, so it is exempt from
  the 44px target size.
