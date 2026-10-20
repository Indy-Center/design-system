---
title: Disclosure
description: A line that opens to show more, built on the native details element.
---

## Checklist

- [ ] Use `Disclosure` for one section of less important content: an
      explanation, a long list a member rarely needs. Don't hide what most
      members need on the page; show it.
- [ ] For a menu that opens from a button, use the menu components
      (`AppsMenu`, `UserMenu`), not this.
- [ ] Write the summary as what opens: "Why do I need a rating?", not
      "More" or "Click to expand".
- [ ] Give several the same `name` when only one should be open at a time.
- [ ] Don't colour it or change its sizes. `class` is for layout only, such
      as a margin or a border between rows.

## Use

```svelte
<script>
  import { Disclosure } from "@indy-center/svelte";
</script>

<Disclosure>
  {#snippet summary()}Why do I need a rating?{/snippet}
  <p>Each position needs its own rating before you can work it.</p>
</Disclosure>
```

## Props

| Prop       | Type                   | Notes                                                                  |
| ---------- | ---------------------- | ---------------------------------------------------------------------- |
| `summary`  | `Snippet`              | Required. The line that is always shown.                               |
| `children` | `Snippet`              | What it shows when open.                                               |
| `open`     | `boolean`              | Whether it is open. Closed by default; bindable.                       |
| `name`     | `string`               | Several with one `name` form a group where only one is open at a time. |
| `class`    | `string`               | Added after Disclosure's own classes. Layout only.                     |
| others     | `<details>` attributes | Passed to the `<details>`: `id`, `ontoggle` and the rest.              |

## Looks

- The summary in the `foreground` role, medium weight; what opens in
  `foreground-soft`, lined up under the summary's text.
- A chevron in `muted-foreground` that turns to point down when open
  (without the turn's animation when the device asks for less motion).
- No frame of its own: put it in a card, or between borders, as the page
  needs.
- A `ring` outline on the summary when reached by keyboard.

## Accessibility

- It renders `<details>` and `<summary>`, so the browser handles the rest:
  Tab reaches the summary, Enter or Space opens and closes it, and screen
  readers announce whether it is expanded.
- The summary is at least 44px tall.
- The chevron is hidden from screen readers.
