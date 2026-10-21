---
title: ColorSchemeSetting
description: The member's colour-scheme choice, light, dark or their device's setting, saved and applied at once.
---

## Checklist

- [ ] Put it in the user menu and on the app's Settings page: the same
      control in both.
- [ ] Use it with the colour-scheme hook's `fallback: 'device'`. Under
      `fallback: 'dark'`, "Use my device's setting" deletes the cookie
      but the next page is served dark.
- [ ] Don't add a Save button or a confirmation: a choice applies at
      once, and the note behind "What's saved?" says what is kept.
- [ ] Don't change its wording, colours or sizes. `class` is for layout
      only.

## Use

```svelte
<script>
  import { ColorSchemeSetting } from "@indy-center/svelte";
</script>

<ColorSchemeSetting />
```

## Props

| Prop     | Type                    | Notes                                                                   |
| -------- | ----------------------- | ----------------------------------------------------------------------- |
| `domain` | `string`                | The domain the cookie is shared across; `flyindycenter.com` by default. |
| `class`  | `string`                | Added to the `<fieldset>`. Layout only.                                 |
| others   | `<fieldset>` attributes | `id`, `aria-*` and the rest, passed to the `<fieldset>`.                |

## What it shows

Three rows, one ticked once the page has loaded:

- **Light** and **Dark** save the choice with `saveColorScheme`.
- **Use my device's setting** deletes it with `clearColorScheme`, and
  the page follows the device. Ticked when nothing is saved.

Under them, "What's saved?" opens the note: "Saved on this browser for a
year, across flyindycenter.com."

Every colour-scheme control on the page shows the same choice.

## Looks

- The legend and rows in `foreground-soft`; the ticked row in
  `foreground`, semibold, on a `muted` fill, with a tick.
- The note in `muted-foreground`.
- A `ring` outline on focus. Every row is at least 44px tall.

## Accessibility

- A `<fieldset>` named by its legend, "Colour scheme". Each row is a
  `<button aria-pressed>`.
- "What's saved?" is a `<button aria-expanded>` for the note.
- The cookie is read in the browser, so until the page has loaded no row
  is ticked.
