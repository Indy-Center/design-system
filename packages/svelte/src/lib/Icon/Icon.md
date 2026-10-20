---
title: Icon
description: An MDI icon in the text colour, hidden from screen readers unless it is given a label.
---

## Checklist

- [ ] Import the icon's path from `@mdi/js`, the default icon set, and pass
      it as `path`. Don't paste SVG markup.
- [ ] Give it a `label` only when it means something no text beside it
      says, such as an icon-only status. An icon next to its own words
      ("Delete") takes no label, so the words aren't read twice.
- [ ] An icon-only button or link is named on the button or link
      (`aria-label`), not on the icon.
- [ ] Don't colour it: it takes the text colour around it. Set `size` for
      its size; `class` is for layout only, such as a margin.

## Use

```svelte
<script>
  import { mdiAirplane, mdiAlert } from "@mdi/js";
  import { Icon } from "@indy-center/svelte";
</script>

<p><Icon path={mdiAirplane} /> Departures</p>
<Icon path={mdiAlert} label="Delayed" size={24} />
```

## Props

| Prop    | Type               | Notes                                                                          |
| ------- | ------------------ | ------------------------------------------------------------------------------ |
| `path`  | `string`           | Required. An MDI path string, from `@mdi/js`.                                  |
| `size`  | `number \| string` | Width and height: pixels, or a CSS length. `1em` (the text's size) by default. |
| `label` | `string`           | What it means. Without one it is hidden from screen readers.                   |
| `class` | `string`           | Added after Icon's own classes. Layout only.                                   |
| others  | `<svg>` attributes | Passed to the `<svg>`.                                                         |

## Looks

- Filled with `currentColor`, so it takes whatever role the text around
  it uses, in either scheme.
- Drawn on MDI's 24-unit grid, sized to `size`.

## Accessibility

- Without a `label`, the `<svg>` has `aria-hidden="true"`, so screen
  readers skip it.
- With a `label`, it has `role="img"` and the label as its name.
