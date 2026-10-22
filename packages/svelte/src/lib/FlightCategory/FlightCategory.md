---
title: FlightCategory
description: A flight category, VFR, MVFR, IFR or LIFR, as a small badge in the FAA's colours, its long name in the abbr's title.
---

## Checklist

- [ ] Use it wherever a page shows an airport's flight category, such as a
      weather row. Don't colour the word yourself.
- [ ] Pass the category your app worked out from the METAR. `FlightCategory`
      doesn't read METARs; the parser stays in the app.
- [ ] Show nothing when the category isn't known: leave the component out
      rather than passing a guess.
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

| Prop       | Type                                 | Notes                                                                 |
| ---------- | ------------------------------------ | --------------------------------------------------------------------- |
| `category` | `"VFR" \| "MVFR" \| "IFR" \| "LIFR"` | Required. Anything else shows nothing, with a warning in development. |
| `class`    | `string`                             | Layout only.                                                          |
| others     | global attributes                    | `id`, `aria-*` and the rest, on the `<abbr>`. It sets `title` itself. |

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

## Accessibility

- An `<abbr>` holding the category, with its long name as `title`, which a
  mouse shows on hover and a screen reader can read as its description.
- The word is always shown, so the colour is never the only cue.
- It isn't a control, so it takes no focus.
