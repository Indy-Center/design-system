---
title: Card
description: The one raised surface, a bordered box on the card role, for an item that stands apart from the page.
---

## Checklist

- [ ] Use it for one item that stands on its own: an event, a partner, a
      form on its own on a page. For a titled block of a dashboard or a
      profile, use `Panel`; for a count, `StatCard`.
- [ ] Set `as` from what it holds: `article` for one item in a feed,
      `li` when the cards are a list (put them in a `<ul>`), `section` for
      a part of the page with its own heading. A `div` otherwise.
- [ ] Give it a heading at the page's next level with `Heading`, not a
      styled `div`.
- [ ] `flush` when the content runs to the edges, such as a divided list
      or a `Table`; the content then brings its own padding.
- [ ] Don't colour it, shadow it or make it translucent: there is one
      card surface. `class` is for layout, such as a margin, a grid
      span or `h-full`.

## Use

```svelte
<script>
  import { Card, Heading, Text } from "@indy-center/svelte";
</script>

<ul class="grid gap-4 sm:grid-cols-2">
  <Card as="li">
    <Heading level={2}>Friday Night Ops</Heading>
    <Text size="small" class="mt-1">Fri 24 Oct · 2300–0200Z</Text>
    <p class="mt-3">Full staffing across Indy Center and its approaches.</p>
  </Card>
</ul>
```

## Props

| Prop       | Type                                      | Notes                                                               |
| ---------- | ----------------------------------------- | ------------------------------------------------------------------- |
| `as`       | `"div" \| "article" \| "section" \| "li"` | The element. `div` by default.                                      |
| `flush`    | `boolean`                                 | No padding, for content that runs to the edges. `false` by default. |
| `children` | `Snippet`                                 | What the card holds.                                                |
| `class`    | `string`                                  | Added after Card's own classes. Layout only.                        |
| others     | attributes of the element                 | Passed to the card, such as `id` or `aria-labelledby`.              |

## Looks

As chosen in the surfaces prototype (ticket 10): border only.

- `card` fill with a 1px `border` edge, `rounded-lg`, no shadow (a shadow
  can't show on the dark page). The roles switch with the scheme: white
  on the grey page in light, a lighter slate on the dark page in dark.
- `p-4` inside; none when `flush`, and the corners then clip the content.
- No text colour of its own: the content takes the page's.

## Accessibility

- Renders the element `as` names, with nothing added. A `div` means
  nothing to a screen reader; an `article`, `li` or `section` does, so
  choose it from the content.
- To make a `section` a landmark a reader can jump to, give it a name:
  `aria-labelledby` the id of its heading (`Panel` does this for you).
- Not interactive. For a card that goes somewhere, put a link on its
  heading's text rather than wrapping the card in one.
