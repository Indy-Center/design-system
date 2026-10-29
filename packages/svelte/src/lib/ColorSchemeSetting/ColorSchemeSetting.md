---
title: ColorSchemeSetting
description: The member's colour-scheme choice, light, dark or their device's setting, saved and applied at once.
---

## Checklist

- [ ] Put it in the user menu and on the app's Settings page: the same
      control in both.
- [ ] Call `setColorScheme({ fallback })` once in the root layout, with
      the hook's `fallback`, and `domain` if it isn't
      `flyindycenter.com`. Under `fallback: 'dark'` (phase 1, and the
      default without `setColorScheme`) the control offers Light and Dark
      only; under `'device'` it offers "Use my device's setting" too.
- [ ] Don't add a Save button or a confirmation: a choice applies at
      once, and the note behind "What's saved?" says what is kept.
- [ ] Don't change its wording, colours or sizes. `class` is for layout
      only.

## Use

`src/routes/+layout.svelte`, with the fallback `src/hooks.server.ts`
gives `colorSchemeHandle`:

```svelte
<script>
  import { setColorScheme } from "@indy-center/centerline-svelte";

  let { children } = $props();
  setColorScheme({ fallback: "dark" });
</script>

{@render children()}
```

Then wherever the member chooses:

```svelte
<script>
  import { ColorSchemeSetting } from "@indy-center/centerline-svelte";
</script>

<ColorSchemeSetting />
```

## Props

| Prop    | Type                    | Notes                                                    |
| ------- | ----------------------- | -------------------------------------------------------- |
| `class` | `string`                | Added to the `<fieldset>`. Layout only.                  |
| others  | `<fieldset>` attributes | `id`, `aria-*` and the rest, passed to the `<fieldset>`. |

The cookie's domain and the hook's fallback come from `setColorScheme`
(see `colorScheme.md`), as the time zone's come from `setTimeZone`.

## What it shows

Rows, one ticked once the page has loaded:

- **Light** and **Dark** save the choice with `saveColorScheme`. Under
  `fallback: 'dark'`, Dark is ticked when nothing is saved, as the page
  is served.
- **Use my device's setting**, under `fallback: 'device'` only, deletes
  it with `clearColorScheme`, and the page follows the device. Ticked
  when nothing is saved. Under `'dark'` the next page would be dark
  whatever the device says, so it isn't offered.

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
