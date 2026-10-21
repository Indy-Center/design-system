---
title: Rating
description: A member's VATSIM rating as a short code in a soft chip, with the long name on hover and focus.
---

## Checklist

- [ ] Use it for a controller's or a pilot's VATSIM rating. For any other
      short code, use `Chip`.
- [ ] Show it only where the page asks for it: a member's menu, a profile,
      a roster column. `Member` and `OnlineController` leave it out.
- [ ] Pass the rating as the data source spells it: `5`, `"C1"` or
      `"Controller1"` all show C1. Don't look it up or shorten it first.
- [ ] Add `kind="pilot"` for a pilot rating, or its number is read from
      the controller table.
- [ ] Don't recolour it: it stays neutral so blue is left for links and
      buttons. `class` is for layout only, such as a margin.

## Use

```svelte
<script>
  import { Rating } from "@indy-center/svelte";
</script>

<Rating rating={user.rating} />
<Rating rating="Controller1" />
<Rating rating={user.pilotRating} kind="pilot" />
```

## Props

| Prop     | Type                      | Notes                                                                                                                                                                              |
| -------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rating` | `number \| string`        | Required. Any spelling `findRating` takes (`5`, `"C1"`, `"Controller1"`, `"Enroute Controller"`), or for a pilot any `findPilotRating` takes (`3`, `"IR"`, `"Instrument Rating"`). |
| `kind`   | `"controller" \| "pilot"` | `"controller"` by default.                                                                                                                                                         |
| `class`  | `string`                  | Added after the chip's own classes. Layout only.                                                                                                                                   |
| others   | `<span>` attributes       | Passed to the chip's `<span>`.                                                                                                                                                     |

A value that is no rating shows as given, as plain chip text without a
long name, and warns in development.

## Looks

`Chip`'s `muted` variant: mono, 12px, semibold, on the `muted` fill
(`#E2E8F0` light, `#334155` dark) in `foreground`. The long name shows
beneath the chip on keyboard focus, in sans, `background` on `foreground`;
a mouse gets the browser's own `title` tooltip. A `ring` outline goes
round the whole chip on keyboard focus (`has-focus-visible:`), though the
focus itself is on the `<abbr>` inside it.

## Accessibility

- An `<abbr title>` inside the chip's `<span>`, holding the short code
  and, after it, the long name in visually hidden text, so a screen
  reader reads "C1 Enroute Controller" without relying on `title`.
- The `<abbr>` takes focus (`tabindex="0"`) so a keyboard user can read
  the long name too. It does nothing on Enter; it isn't a control, so it
  is exempt from the 44px target size.
