---
title: Badge
description: A short tinted label for a kind or a status, such as an event type or "Draft".
---

## Checklist

- [ ] Use it to label what something is ("Member perk", "Training") or
      its state ("Draft", "In progress": add `pill`). For a short code in
      mono (operating initials, a staff role), use `Chip`. For a message,
      use `Alert`.
- [ ] Always give it text, even with an icon: a badge is never icon-only
      (it warns while developing). Keep the text to a word or two.
- [ ] Don't rely on the colour alone to carry meaning: the text says it.
- [ ] Pick the colour with `variant`; don't recolour it with classes.
      `class` is for layout only, such as a margin.
- [ ] It isn't a button or a link. To make something pressable, use
      `Button` or `Link` and put the badge's text in it.

## Use

```svelte
<script>
  import { Badge, Icon } from "@indy-center/centerline-svelte";
  import { mdiStar } from "@mdi/js";
</script>

<Badge variant="yellow" size="sm">
  {#snippet icon()}<Icon path={mdiStar} />{/snippet}
  Member perk
</Badge>

<Badge variant="gray" pill>Draft</Badge>
```

## Props

| Prop       | Type                                                                                | Notes                                                        |
| ---------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `variant`  | `"sky" \| "purple" \| "green" \| "red" \| "orange" \| "yellow" \| "blue" \| "gray"` | `"sky"` by default. All eight are in `BADGE_VARIANTS`.       |
| `size`     | `"sm" \| "md"`                                                                      | `"md"` by default (14px). `"sm"` (12px) for tables and rows. |
| `pill`     | `boolean`                                                                           | Round ends and a stronger tint, for a status.                |
| `icon`     | `Snippet`                                                                           | An icon before the text. Hidden from screen readers.         |
| `children` | `Snippet`                                                                           | Required. The text.                                          |
| `class`    | `string`                                                                            | Added after Badge's own classes. Layout only.                |
| others     | `<span>` attributes                                                                 | Passed to the `<span>`.                                      |

## Looks

The brand guide's status badges, on Tailwind's colour steps, since the
roles have no hues for them:

- **Light:** a 10% tint of the colour's `-600` step, a 30% border of it,
  and text in `-800`.
- **Dark** (and in the dark header): the same from `-500`, with text in
  `-300`.
- **Pill:** round ends, a 20% tint and a 50% border.

Every colour passes 4.5:1 on `background` and on `card` in both schemes,
as a badge and as a pill. Corners are 8px.

## Accessibility

- A `<span>`, so it can sit inside a button, link or sentence.
- Its text is what screen readers say; the icon is `aria-hidden`.
