---
title: Heading
description: A real h1 to h6 at the level you give it, with its size set apart, so headings stay in order however they look.
---

## Checklist

- [ ] Set `level` from the page's outline, never from the size you want:
      one `h1` per page, and no skipped levels (an `h2` before any `h3`).
- [ ] If the level's size is wrong for the spot, set `look`, not a class
      and not a different `level`.
- [ ] For the small uppercase label above a group (a section in a sidebar,
      a settings group), use `look="label"`. Write the text in sentence
      case; the look makes it uppercase.
- [ ] Don't colour, resize or re-weight it with classes. `class` is for
      layout only, such as a margin.
- [ ] A page's title, with its lead line and actions, belongs in
      `PageHeader`; a panel's title in `Panel`. Both use `Heading` inside.

## Use

```svelte
<script>
  import { Heading } from "@indy-center/svelte";
</script>

<Heading level={1}>Events</Heading>
<Heading level={2}>This week</Heading>

<!-- A sidebar group: an h2 in the outline, the label look on screen. -->
<Heading level={2} look="label">Facilities</Heading>
```

## Props

| Prop       | Type                     | Notes                                                        |
| ---------- | ------------------------ | ------------------------------------------------------------ |
| `level`    | `1` – `6`                | Required. The element: `h1` to `h6`.                         |
| `look`     | `1` – `4`, or `"label"`  | The size. The level's own look by default; `h5`, `h6` get 4. |
| `children` | `Snippet`                | The heading's text.                                          |
| `class`    | `string`                 | Added after Heading's own classes. Layout only.              |
| others     | `<h1>`–`<h6>` attributes | Passed to the heading, such as `id` for a link to it.        |

## Looks

| Look      | Size        | Font                                             | Colour             |
| --------- | ----------- | ------------------------------------------------ | ------------------ |
| `1`       | `text-3xl`  | `font-heading`, semibold                         | `foreground`       |
| `2`       | `text-xl`   | `font-heading`, semibold                         | `foreground`       |
| `3`       | `text-lg`   | `font-heading`, semibold                         | `foreground`       |
| `4`       | `text-base` | `font-heading`, semibold                         | `foreground`       |
| `"label"` | `text-xs`   | body font, semibold, uppercase, `tracking-wider` | `muted-foreground` |

The roles switch with the scheme by themselves: `foreground` is near-black
in light and white in dark and in the header.

## Accessibility

- Renders `<h1>` to `<h6>`, so screen readers list it and jump to it by
  heading and by level. `look` never changes the element.
- The label look is uppercase only on screen (`text-transform`); readers
  get the text as written, so write it in sentence case.
