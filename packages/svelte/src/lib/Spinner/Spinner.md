---
title: Spinner
description: A busy indicator that says what is happening to screen readers and holds still for members who ask for less motion.
---

## Checklist

- [ ] Use it while something loads or saves and its length isn't known.
      For a known amount done, use `ProgressBar`. On a button, use
      `Button busy`, which shows one for you. (`ProgressBar` arrives in
      this release.)
- [ ] Set `label` when "Loading" isn't what is happening: "Saving",
      "Signing in".
- [ ] Take it away when the work is done, and show the result.
- [ ] Don't colour or resize it with classes: it takes the text's colour
      and size. Put it in text of the size you want. `class` is for
      layout only, such as a margin.

## Use

```svelte
<script>
  import { Spinner } from "@indy-center/centerline-svelte";
</script>

{#if saving}
  <Spinner label="Saving" />
{/if}
```

## Props

| Prop    | Type                | Notes                                           |
| ------- | ------------------- | ----------------------------------------------- |
| `label` | `string`            | Spoken by screen readers. "Loading" by default. |
| `class` | `string`            | Added after Spinner's own classes. Layout only. |
| others  | `<span>` attributes | Passed to the outer `<span>`.                   |

## Looks

- A ring in `currentColor`, a quarter of it solid and the rest faint, 1em
  across, so it matches the text around it in either scheme.
- It turns once a second. When the device asks for less motion
  (`prefers-reduced-motion: reduce`), it holds still.

## Accessibility

- A `<span role="status">` holding the label as screen-reader-only text;
  the ring itself is `aria-hidden`.
- `status` is a polite live region: readers say the label without
  interrupting. Some readers announce a live region only when its text
  changes, not when it arrives with text in it, so Spinner puts its label
  in just after it appears on the page.
