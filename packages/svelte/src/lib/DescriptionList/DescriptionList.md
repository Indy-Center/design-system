---
title: DescriptionList
description: Label and value rows for one thing's details, stacked on phones.
---

## Checklist

- [ ] Use `DescriptionList` for one thing's details: a member's CID and
      rating, a request's status and dates, a document's version and owner.
      For many things with the same columns, use `Table`.
- [ ] Wrap each label and its value in a `<div>`: `<div><dt>CID</dt><dd>…</dd></div>`.
      A row may have more than one `<dd>`.
- [ ] Write the label (`<dt>`) as a short noun, with no colon.
- [ ] Put anything in the value (`<dd>`): text, a `Link`, a badge.
      `font-mono` on a CID's `<dd>` is fine.
- [ ] Don't colour labels or values or change their size. `class` is for
      layout only, such as a margin.

## Use

```svelte
<script>
  import { DescriptionList } from "@indy-center/centerline-svelte";

  let { data } = $props();
</script>

<DescriptionList>
  <div>
    <dt>CID</dt>
    <dd class="font-mono">{data.member.cid}</dd>
  </div>
  <div>
    <dt>Rating</dt>
    <dd>{data.member.rating}</dd>
  </div>
</DescriptionList>
```

## Props

| Prop       | Type              | Notes                                                     |
| ---------- | ----------------- | --------------------------------------------------------- |
| `children` | `Snippet`         | Required. The rows: a `<div>` around each `<dt>`, `<dd>`. |
| `class`    | `string`          | Added to the `<dl>` after its own classes. Layout only.   |
| others     | `<dl>` attributes | Passed to the `<dl>`.                                     |

## Looks

- Labels are small, medium weight, `muted-foreground`; values are small
  `foreground`.
- A `border` line runs between rows.
- Until the list is 24rem wide (a phone, or a narrow column), each value
  sits under its label. From there, labels take the first third and
  values the rest, so the values line up.
- No border or padding around the list: put it in a card or panel.

## Accessibility

- Renders a `<dl>`. Screen readers announce it as a list, each `<dt>` as
  a term and each `<dd>` as its definition (WCAG 1.3.1).
- The `<div>` around each pair is allowed inside a `<dl>`, and changes
  nothing a screen reader says.
