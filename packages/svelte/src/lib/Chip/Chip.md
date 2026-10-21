---
title: Chip
description: A small mono label for a short code, such as operating initials, a rating or a staff role.
---

## Checklist

- [ ] Use it for a short code read as a code: operating initials, a
      rating, a staff role, a certification. For a word or two of plain
      text ("Draft", "Member perk"), use `Badge`. For a chip that turns
      a filter on and off, use `FilterChip`.
- [ ] Pick `variant` for what it shows: `initials` for operating
      initials; `senior`, `training` or `team` for a staff group;
      `certification` for a certification; `muted` (the default) for
      anything else, such as a rating.
- [ ] When the code needs explaining ("HY" is someone's initials), say so
      in text a screen reader reaches: a visually hidden suffix, or an
      `<abbr title>` around the code.
- [ ] Don't recolour it with classes. `class` is for layout only, such as
      a margin.

## Use

```svelte
<script>
  import { Chip, Icon } from "@indy-center/svelte";
  import { mdiSchool } from "@mdi/js";
</script>

<Chip variant="initials">HY</Chip>
<Chip variant="senior">ATM</Chip>
<Chip>S3</Chip>

<Chip variant="training">
  {#snippet icon()}<Icon path={mdiSchool} />{/snippet}
  INS
</Chip>
```

## Props

| Prop       | Type                                                                           | Notes                                                 |
| ---------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `variant`  | `"muted" \| "initials" \| "senior" \| "training" \| "team" \| "certification"` | `"muted"` by default. All six are in `CHIP_VARIANTS`. |
| `icon`     | `Snippet`                                                                      | An icon before the code. Hidden from screen readers.  |
| `children` | `Snippet`                                                                      | Required. The code.                                   |
| `class`    | `string`                                                                       | Added after Chip's own classes. Layout only.          |
| others     | `<span>` attributes                                                            | Passed to the `<span>`.                               |

## Looks

Mono, 12px, semibold, with 6px corners.

| Variant         | Fill                                      | Text         |
| --------------- | ----------------------------------------- | ------------ |
| `muted`         | `muted` (`#E2E8F0` light, `#334155` dark) | `foreground` |
| `initials`      | `indigo-600`                              | white        |
| `senior`        | `amber-700`                               | white        |
| `training`      | `rose-700`                                | white        |
| `team`          | `slate-600`                               | white        |
| `certification` | `emerald-700`                             | white        |

The roles have no hues for these, so the coloured variants use Tailwind's.
Their fills are solid and the same in both schemes, and white text passes
4.5:1 on each, on any surface.

## Accessibility

- A `<span>` holding the code as text, so readers say it as written.
- Readers spell out a code letter by letter or read it as a word; add the
  long form (see the checklist) where that matters.
