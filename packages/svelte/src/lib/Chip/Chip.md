---
title: Chip
description: A small mono label for a short code, such as operating initials, a rating or a staff role.
---

## Checklist

- [ ] Use it for a short code read as a code: operating initials, a
      rating, a staff role. For a word or two of plain text ("Draft",
      "Member perk"), use `Badge`.
- [ ] Pick `tone` for what it shows: `initials` for operating initials,
      `senior`, `training` or `team` for a staff group, `muted` (the
      default) for anything else, such as a rating.
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

<Chip tone="initials">HY</Chip>
<Chip tone="senior">ATM</Chip>
<Chip>S3</Chip>

<Chip tone="training">
  {#snippet icon()}<Icon path={mdiSchool} />{/snippet}
  INS
</Chip>
```

## Props

| Prop       | Type                                                        | Notes                                                |
| ---------- | ----------------------------------------------------------- | ---------------------------------------------------- |
| `tone`     | `"muted" \| "initials" \| "senior" \| "training" \| "team"` | `"muted"` by default.                                |
| `icon`     | `Snippet`                                                   | An icon before the code. Hidden from screen readers. |
| `children` | `Snippet`                                                   | Required. The code.                                  |
| `class`    | `string`                                                    | Added after Chip's own classes. Layout only.         |
| others     | `<span>` attributes                                         | Passed to the `<span>`.                              |

## Looks

Mono, 12px, semibold, with 6px corners.

| Tone       | Fill                                      | Text         |
| ---------- | ----------------------------------------- | ------------ |
| `muted`    | `muted` (`#E2E8F0` light, `#334155` dark) | `foreground` |
| `initials` | `indigo-600`                              | white        |
| `senior`   | `amber-700`                               | white        |
| `training` | `rose-700`                                | white        |
| `team`     | `slate-600`                               | white        |

The roles have no colours for initials or staff groups, so the coloured
tones keep the community site's Tailwind hues (decision 0004). They are
solid, so they look and read the same in either scheme and on any
surface: white text passes 4.5:1 on each. The community site's chips were
see-through (`-600/80`); on a light page white fell to 2.5–4.3:1 on amber,
emerald, rose, sky and indigo, and amber failed in dark too.

There is no green tone for certifications: they move to `Credential`,
tinted on the `success` role. Until it arrives (later in this release),
the community site keeps its own certification chips.

## Accessibility

- A `<span>` holding the code as text, so readers say it as written.
- Readers spell out a code letter by letter or read it as a word; add the
  long form (see the checklist) where that matters.
