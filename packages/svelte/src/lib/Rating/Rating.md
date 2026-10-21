---
title: Rating
description: A member's VATSIM rating as a short code in a soft chip, with the long name in a tooltip.
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
- [ ] Add `focusable` where a page has only a few ratings (a member's
      menu, a profile), so a keyboard can reach its long name. Leave it
      off in a roster column, which would get a tab stop per row. Screen
      readers read the long name either way.
- [ ] Don't recolour it: it stays neutral so blue is left for links and
      buttons. `class` is for layout only, such as a margin.

## Use

```svelte
<script>
  import { Rating } from "@indy-center/svelte";
</script>

<Rating rating={user.rating} />
<Rating rating="Controller1" focusable />
<Rating rating={user.pilotRating} kind="pilot" />
```

## Props

| Prop        | Type                      | Notes                                                                                                                                                                              |
| ----------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rating`    | `number \| string`        | Required. Any spelling `findRating` takes (`5`, `"C1"`, `"Controller1"`, `"Enroute Controller"`), or for a pilot any `findPilotRating` takes (`3`, `"IR"`, `"Instrument Rating"`). |
| `kind`      | `"controller" \| "pilot"` | `"controller"` by default.                                                                                                                                                         |
| `focusable` | `boolean`                 | Makes it a tab stop. `false` by default.                                                                                                                                           |
| `class`     | `string`                  | Added to the `Tooltip` box round the chip. Layout only.                                                                                                                            |
| others      | `<span>` attributes       | Passed to the chip's `<span>`.                                                                                                                                                     |

A value that is no rating shows as given, as plain chip text without a
long name or tooltip, and warns in development. Its chip takes `class`
as well as the other attributes.

## Looks

`Chip`'s `muted` variant: mono, 12px, semibold, on the `muted` fill
(`#E2E8F0` light, `#334155` dark) in `foreground`. The long name shows in
a `Tooltip` above the chip (below when there's no room) while a mouse is
on it, and on keyboard focus when `focusable`: `background` on
`foreground`. When `focusable`, a `ring` outline goes round the whole
chip on keyboard focus (`has-focus-visible:`), though the focus itself is
on the `<abbr>` inside it. A tap on a phone shows no tooltip.

## Accessibility

- An `<abbr>` inside the chip's `<span>`, holding the short code and,
  after it, the long name in visually hidden text, so a screen reader
  reads "C1 Enroute Controller", with or without `focusable`.
- The long name is read once. The `<abbr>` has no `title` (some screen
  readers would say it again, and the browser's own tooltip would show
  beside ours). The tooltip is `aria-hidden`, and the `<abbr>` doesn't
  take Tooltip's `aria-describedby`, unlike Tooltip's other triggers.
- With `focusable`, the `<abbr>` takes focus (`tabindex="0"`) so a
  keyboard user can show the tooltip too; Escape hides it. Without it,
  it is no tab stop. It does nothing on Enter; it isn't a control, so it
  is exempt from the 44px target size.
