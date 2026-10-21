---
title: Credential
description: A member's certification, endorsement or solo as a short code in a chip tinted by kind, with the long name in a tooltip and a solo's expiry.
---

## Checklist

- [ ] Use it for a certification, an endorsement or a solo a member
      holds: a roster, a profile, an event's requirements. For a VATSIM
      rating, use `Rating`.
- [ ] Pass the `code`, the long `name` and the `kind` as training gives
      them. Don't look them up or shorten them in the app: training holds
      the names and who holds what.
- [ ] Pass a solo's expiry as `until`; the chip writes "until 3 Nov".
- [ ] Add `focusable` where a page has only a few credentials (a
      profile), so a keyboard can reach the long name. Leave it off in a
      roster column, which would get a tab stop per chip. Screen readers
      read the long name either way.
- [ ] Don't recolour it: the colour says the kind. `class` is for layout
      only, such as a margin.

## Use

```svelte
<script>
  import { Credential } from "@indy-center/svelte";
</script>

<Credential code="S-GC" name="Simple Ground Control" kind="certification" />
<Credential code="S-LC" name="Simple Local Control" kind="endorsement" />

<!-- APP-SOLO · until 3 Nov -->
<Credential
  code="APP-SOLO"
  name="Approach solo"
  kind="solo"
  until="2026-11-03"
  focusable
/>
```

## Props

| Prop        | Type                                         | Notes                                                                                                                          |
| ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `code`      | `string`                                     | Required. The short code: `"S-GC"`, `"APP-SOLO"`.                                                                              |
| `name`      | `string`                                     | The long name: `"Simple Ground Control"`. Without it, the code shows alone, with no tooltip.                                   |
| `kind`      | `"certification" \| "endorsement" \| "solo"` | Required. Sets the colour. `CredentialKind`, exported from the package.                                                        |
| `until`     | `Date \| string`                             | A solo's expiry: a date (`"2026-11-03"`), or a `Date` or ISO instant with its zone, read in Zulu. Shown for any kind given it. |
| `focusable` | `boolean`                                    | Makes it a tab stop, when it has a `name`. `false` by default.                                                                 |
| `class`     | `string`                                     | Added to the `Tooltip` box round the chip. Layout only.                                                                        |
| others      | `<span>` attributes                          | Passed to the chip's `<span>`.                                                                                                 |

Without a `name`, the chip has no `Tooltip` box, so it takes `class` as
well as the other attributes, and it is no tab stop. A date-time string
without a zone (`"2026-11-03T22:00"`) is read in the device's zone, so
the server and the browser may disagree on its day: pass a date alone or
an instant with its zone.

## What it shows

- The code, then for a solo with `until`: `APP-SOLO · until 3 Nov`, day
  before month as `Time` writes dates, with no year.
- The date is Zulu's: an instant of `2026-11-04T02:00Z` is "until 4 Nov",
  though it's still the 3rd in Indiana.
- An `until` that isn't a date is left out, and warns in development.

## Looks

`Chip`, mono, 12px, semibold; the expiry in the body font at normal
weight.

| Kind            | Chip variant    | Fill                 | Text         |
| --------------- | --------------- | -------------------- | ------------ |
| `certification` | `certification` | `emerald-700`, solid | white        |
| `endorsement`   | `endorsement`   | `info` at 20%        | `foreground` |
| `solo`          | `solo`          | `warning` at 20%     | `foreground` |

The text passes 4.5:1 on each, on the page and on a card, in every
scheme. The long name shows in a `Tooltip` above the chip (below when
there's no room) while a mouse is on it, and on keyboard focus when
`focusable`: `background` on `foreground`. When `focusable`, a `ring`
outline goes round the whole chip on keyboard focus. A tap on a phone
shows no tooltip.

## Accessibility

As `Rating`:

- An `<abbr>` inside the chip's `<span>`, holding the code and, after it,
  the long name in visually hidden text, so a screen reader reads
  "APP-SOLO Approach solo until 3 Nov", with or without `focusable`. The
  `·` is hidden from it.
- The long name is read once. The `<abbr>` has no `title`, the tooltip is
  `aria-hidden`, and the `<abbr>` doesn't take Tooltip's
  `aria-describedby`.
- With `focusable`, the `<abbr>` takes focus (`tabindex="0"`) so a
  keyboard user can show the tooltip too; Escape hides it. Without it,
  it is no tab stop. It isn't a control, so it is exempt from the 44px
  target size.
- The expiry is a `<time datetime="2026-11-03">`.
