---
title: StatCard
description: One count on a dashboard, with its label, a sub-line and an icon tile, on the card surface.
---

## Checklist

- [ ] Use it for a count at the top of a dashboard (users, events,
      sessions). For several facts about one thing, use `DescriptionList`;
      for rows of counts, a `Table`.
- [ ] `label` says what is counted, in sentence case ("Total users").
      `detail` breaks the count down or gives its context ("287
      controllers"); leave it out rather than repeat the label.
- [ ] Pass `value` as a number where you have one: it gets thousands
      separators.
- [ ] Give each card in a row an icon, or none: the tile is one colour
      for all, so don't colour icons to tell cards apart.
- [ ] Don't colour or resize it with classes. `class` is for layout, such
      as a grid cell's span.

## Use

```svelte
<script>
  import { Icon, StatCard } from "@indy-center/svelte";
  import { mdiAccount, mdiCalendar } from "@mdi/js";
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard label="Total users" value={412} detail="287 controllers">
    {#snippet icon()}<Icon path={mdiAccount} />{/snippet}
  </StatCard>
  <StatCard label="Events" value={38} detail="31 published">
    {#snippet icon()}<Icon path={mdiCalendar} />{/snippet}
  </StatCard>
</div>
```

## Props

| Prop     | Type               | Notes                                                                                   |
| -------- | ------------------ | --------------------------------------------------------------------------------------- |
| `label`  | `string`           | Required. What is counted: the list's `<dt>`.                                           |
| `value`  | `string \| number` | Required. The count: a `<dd>`. A number gets thousands separators ("12,345").           |
| `detail` | `string`           | The sub-line under the count: a second `<dd>`. Nothing renders without it.              |
| `icon`   | `Snippet`          | An icon for the tile on the right, such as `Icon`; 24px at its default `1em`. Optional. |
| `class`  | `string`           | Added to the card, the box around the list. Layout only.                                |
| others   | `<dl>` attributes  | Passed to the list inside the card, such as `id` or `aria-*`.                           |

## Looks

As chosen in the surfaces prototype (ticket 10), today's dashboard layout
on the roles:

- The card: `card` fill with a `border` edge, rounded, no shadow.
- The label: `text-sm` in `muted-foreground`.
- The count: `text-2xl` semibold in `font-heading`, `foreground`.
- The sub-line: `text-sm` in `muted-foreground` (the community site's was
  `text-xs` in `slate-500`, under 4.5:1). Readable on the page and on a
  card in both schemes.
- The tile: `primary` at 15% behind the icon, the icon in `link`
  (`#0369A1` in light, `#38BDF8` in dark). One colour for every card.

## Accessibility

- Renders a `<div>` card around a `<dl>`: the label is the `<dt>`, the
  count and sub-line its `<dd>`s, so a screen reader reads them as a
  term and its values, in that order.
- The icon tile is `aria-hidden`: it repeats the label. It sits after the
  list, so it doesn't come between the term and its count.
- Not interactive. To link a count to its page, put the link in the page
  around or beside it, not inside the tile.
