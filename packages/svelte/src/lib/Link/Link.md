---
title: Link
description: A text link to another page or site, in the link colour and underlined.
---

## Checklist

- [ ] Use `Link` for text that goes to another page or site. For an action
      on the same page (open, save, delete), use a button.
- [ ] Write text that says where it goes: "Event schedule", not "click
      here" or a bare URL.
- [ ] Don't colour it: no `text-*` or `decoration-*` classes. `class` is
      for layout only, such as a margin.
- [ ] Say so in the text when it opens a new tab or downloads a file.
- [ ] Inside the dark header or footer it takes the dark colours by
      itself; nothing to add.

## Use

```svelte
<script>
  import { Link } from "@indy-center/svelte";
</script>

<p>
  See the <Link href="/events">event schedule</Link> for this week's events.
</p>
```

## Props

| Prop       | Type             | Notes                                                              |
| ---------- | ---------------- | ------------------------------------------------------------------ |
| `href`     | `string`         | Required.                                                          |
| `children` | `Snippet`        | The link's text.                                                   |
| `class`    | `string`         | Added after Link's own classes. Layout only.                       |
| others     | `<a>` attributes | Passed to the `<a>`: `target`, `rel`, `aria-current` and the rest. |

## Looks

- The `link` role: Sky (`#0369A1`) in light, `#38BDF8` in dark.
- Always underlined, so it doesn't rely on colour alone (WCAG 1.4.1); the
  underline thickens on hover.
- A `ring` outline when reached by keyboard.

## Accessibility

- It renders a plain `<a href>`, so the browser gives it its role, focus
  and Enter to follow.
- A link inside a sentence is exempt from the 44px target size (WCAG 2.5.8,
  inline exception). A link that stands alone as a control, in a list or a
  menu, belongs to the component that holds it, which makes it 44px tall.
