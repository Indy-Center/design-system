---
title: Badge
description: A short tinted label for a kind or a status, such as an event type or "Draft".
---

## Checklist

- [ ] Use it to label what something is ("Member perk", "Training") or
      its state ("Draft", "In progress": add `pill`). For a short code in
      mono (operating initials, a staff role), use `Chip`. For a message,
      use `Alert`.
- [ ] Always give it text, even with an icon: a badge is never icon-only.
      Keep the text to a word or two.
- [ ] Don't rely on the colour alone to carry meaning: the text says it.
- [ ] Pick the colour with `color`; don't recolour it with classes.
      `class` is for layout only, such as a margin.
- [ ] It isn't a button or a link. To make something pressable, use
      `Button` or `Link` and put the badge's text in it.

## Use

```svelte
<script>
  import { Badge, Icon } from "@indy-center/svelte";
  import { mdiStar } from "@mdi/js";
</script>

<Badge color="yellow" size="sm">
  {#snippet icon()}<Icon path={mdiStar} />{/snippet}
  Member perk
</Badge>

<Badge color="gray" pill>Draft</Badge>
```

## Props

| Prop       | Type                                                                                | Notes                                                        |
| ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `color`    | `"sky" \| "purple" \| "green" \| "red" \| "orange" \| "yellow" \| "blue" \| "gray"` | `"sky"` by default.                                          |
| `size`     | `"sm" \| "md"`                                                                      | `"md"` by default (14px). `"sm"` (12px) for tables and rows. |
| `pill`     | `boolean`                                                                           | Round ends, for a status.                                    |
| `icon`     | `Snippet`                                                                           | An icon before the text. Hidden from screen readers.         |
| `children` | `Snippet`                                                                           | Required. The text.                                          |
| `class`    | `string`                                                                            | Added after Badge's own classes. Layout only.                |
| others     | `<span>` attributes                                                                 | Passed to the `<span>`.                                      |

## Looks

The brand guide's status badges, built from Tailwind's colour steps
(decision 0004), not the roles:

- **Light:** a 10% tint of the colour's `-600` step, text in its `-800`,
  and a border of `-600` at 30%.
- **Dark** (and in the dark header): a 10% tint of `-500`, text in
  `-300`, and a border of `-500` at 30%.

Every colour's text passes 4.5:1 on `background` and on `card` in both
schemes. Corners are 8px; a `pill` has round ends.

## Accessibility

- A `<span>`, so it can sit inside a button, link or sentence.
- Its text is what screen readers say; the icon is `aria-hidden`.
