---
title: Panel
description: A titled block on the card surface, a section with a heading at the level you give it and a rule under it, above its body.
---

## Checklist

- [ ] Use it for a titled block on a dashboard, profile or settings page:
      controllers online, recent sessions. For an item without a title
      bar, use `Card`.
- [ ] Set `level` from the page's outline: `2` under the page's `h1`, `3`
      inside a section with an `h2`. It looks the same at any level.
- [ ] Write `title` in sentence case ("Controllers online"); it isn't
      shown in capitals.
- [ ] `flush` when the body runs to the edges, such as a divided list;
      the body then brings its own padding (`px-4 py-3` rows line up with
      the title). Not for a `Table`: it has its own border, so leave the
      body padded.
- [ ] In a flush body, give focusable rows that reach the edges an inset
      ring (`focus-visible:-outline-offset-2`), as `Tabs` does: the
      panel's corners clip an outer one.
- [ ] An `icon` is optional; give every panel on a page one, or none.
- [ ] Don't colour it or resize the title with classes. `class` is for
      layout, such as `h-full` to fill a grid row.

## Use

```svelte
<script>
  import { Icon, Panel } from "@indy-center/centerline-svelte";
  import { mdiRadar } from "@mdi/js";
</script>

<Panel title="Controllers online" level={2} flush>
  {#snippet icon()}<Icon path={mdiRadar} />{/snippet}
  <ul class="divide-y divide-border">
    <li class="px-4 py-3">IND_CTR</li>
    <li class="px-4 py-3">IND_APP</li>
  </ul>
</Panel>
```

## Props

| Prop       | Type                   | Notes                                                                |
| ---------- | ---------------------- | -------------------------------------------------------------------- |
| `title`    | `string`               | Required. The panel's heading, and its name as a region.             |
| `level`    | `2` – `6`              | Required. The heading's element: `h2` to `h6`.                       |
| `icon`     | `Snippet`              | An icon before the title, such as `Icon`; 20px at its default `1em`. |
| `flush`    | `boolean`              | No padding round the body. `false` by default (`p-4`).               |
| `children` | `Snippet`              | The body.                                                            |
| `class`    | `string`               | Added to the section. Layout only.                                   |
| others     | `<section>` attributes | Passed to the section, such as `id`; not `aria-labelledby`.          |

## Looks

As chosen in the surfaces prototype (ticket 10):

- The surface is a flush `Card`: `card` fill, `border` edge, rounded, no
  shadow.
- The title bar: `px-4 py-3`, a `border` rule under it. The title is
  `Heading`'s look 4 at every level: `text-base` semibold in
  `font-heading`, `foreground`, sentence case. No uppercase bar.
- The icon in `muted-foreground`.
- The body `p-4`, or none when `flush`.

## Accessibility

- Renders a `<section>` named by its heading (`aria-labelledby`), so it
  is a region a screen reader can list and jump to, and the heading sits
  in the page's outline at `level`.
- A caller's `aria-labelledby` is ignored: the title always names the
  region, so the name on screen and the name read out stay the same.
- The icon is `aria-hidden`: it stays out of the heading and the
  region's name.
- With many panels on a page, each is a region; keep titles distinct so
  the list of regions reads well.
