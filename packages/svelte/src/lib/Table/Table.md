---
title: Table
description: A data table with a caption, header cells that say what they head, and a scroll region for phones.
---

## Checklist

- [ ] Use `Table` for data with rows and columns: a roster, a list of
      positions, a waitlist. For one thing's details (a member's CID,
      rating and home facility), use `DescriptionList`. Don't use a table
      for layout.
- [ ] Give it a `caption` that says what the rows are ("Online
      controllers"). If a heading just above already says it, set
      `hideCaption`: the caption still names the table for screen readers.
- [ ] Write every header cell as `Th`, with its `scope`: `"col"` in
      `<thead>`, `"row"` for the cell that names its row (a callsign, a
      name). Use `"colgroup"` over a header that spans a group of columns.
      Don't write `<th>` by hand. An empty corner cell is a `<td></td>`.
- [ ] Write `<thead>` and `<tbody>` yourself, with plain `<tr>` and `<td>`.
- [ ] For a row that goes somewhere, put a `Link` in the cell that names it
      (usually the first). Never put `onclick` on a `<tr>`: a keyboard
      can't reach it and a screen reader doesn't announce it.
- [ ] Don't colour cells, rows or the head, and don't add padding to
      cells. `class` is for layout only, such as a margin.
- [ ] Put it in a column that has a width of its own: the table takes
      the column's width and scrolls inside it, so it shrinks to nothing
      in a parent that sizes to its content (`w-fit`, `inline-block`). As
      an item in a flex row, give it `class="flex-1"`.

## Use

```svelte
<script>
  import { Link, Table, Th } from "@indy-center/svelte";

  let { data } = $props();
</script>

<Table>
  {#snippet caption()}Online controllers{/snippet}
  <thead>
    <tr>
      <Th scope="col">Callsign</Th>
      <Th scope="col">Frequency</Th>
      <Th scope="col">Controller</Th>
    </tr>
  </thead>
  <tbody>
    {#each data.controllers as controller (controller.cid)}
      <tr>
        <Th scope="row">{controller.callsign}</Th>
        <td>{controller.frequency}</td>
        <td><Link href="/roster/{controller.cid}">{controller.name}</Link></td>
      </tr>
    {/each}
  </tbody>
</Table>
```

## Props

### Table

| Prop          | Type                 | Notes                                                       |
| ------------- | -------------------- | ----------------------------------------------------------- |
| `caption`     | `Snippet`            | Required. Names the table and its scroll region.            |
| `hideCaption` | `boolean`            | Hides the caption from sight; screen readers still read it. |
| `children`    | `Snippet`            | Required. The `<thead>` and `<tbody>`.                      |
| `class`       | `string`             | Added to the scroll region around the table. Layout only.   |
| others        | `<table>` attributes | Passed to the `<table>`.                                    |

### Th

| Prop       | Type                                         | Notes                                |
| ---------- | -------------------------------------------- | ------------------------------------ |
| `scope`    | `"col" \| "row" \| "colgroup" \| "rowgroup"` | Required. Which cells it heads.      |
| `children` | `Snippet`                                    | Required. The header's text.         |
| others     | `<th>` attributes                            | Passed to the `<th>`, `colspan` too. |

## Looks

- The region has a `border` line and rounded corners; the table is on
  `card`.
- The caption is in the heading font, `foreground`, above the head.
- The head is on `muted`; header cells are semibold `foreground`.
- Cells are small `foreground-soft` text; a row header in the body is
  medium weight `foreground`.
- A `border` line runs between rows.
- The region gets the `ring` outline when focused.

The table's classes are written on the `<table>` and reach its plain
cells. They aren't exported yet; the rich-text feature will share them
with tables from the CMS.

## Accessibility

- Renders a `<div role="region" tabindex="0">` labelled by the
  `<caption>`, around a `<table>`. On a narrow screen the table scrolls
  sideways inside the region, not the page; the region is one Tab stop,
  so a keyboard can focus it and scroll with the arrow keys (WCAG 2.1.1).
- The caption is the table's accessible name, and the region's.
- `Th` sets `scope`, so a screen reader announces each cell with its
  column and row headers.
- Links in cells are ordinary links: Tab reaches each one.
- The region has `contain: inline-size`, so a wide table never widens a
  page's grid or flex column on a phone (WCAG 1.4.10, reflow).
