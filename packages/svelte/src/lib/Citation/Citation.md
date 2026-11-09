---
title: Citation
description: Where a text comes from, such as the FAA's JO 7110.65 at 3-7-2, with the place linked to the source.
---

## Checklist

- [ ] Use it to say where a text comes from or where to read more: an FAA
      order, one of Indy's own SOPs. In CMS rich text it is the inline
      `citation` block, drawn by [`RichText`](../RichText/RichText.md); in
      a sentence, or in a `reference` [`Callout`](../Callout/Callout.md)
      for "for more, see …".
- [ ] Give the `source` its name and edition, and a `url` or an attached
      file for it. Don't copy the source's text into the document.
- [ ] Write `at` as the source numbers its own parts: "3-7-2",
      "Chapter 4", "Appendix B". Link to the whole source, never to a
      paragraph inside an FAA order: the FAA renumbered its anchors with
      7110.65BB Change 3.
- [ ] Don't change its look. `class` is for layout only.

## Use

```svelte
<script>
  import { Citation } from "@indy-center/centerline-svelte";
</script>

<p>
  Hold departures behind a heavy for two minutes, per
  <Citation
    source={{
      name: "JO 7110.65",
      edition: "BB",
      url: "https://www.faa.gov/air_traffic/publications/atpubs/atc_html/",
    }}
    at="3-9-6"
  />.
</p>
```

## Props

| Prop     | Type                                                                        | Notes                                                           |
| -------- | --------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `source` | `{ name: string; edition?: string; url?: string; file?: { url?: string } }` | Required. Its name and edition are written in the `<cite>`.     |
| `at`     | `string`                                                                    | The place in the source. A link when the source has an address. |
| `class`  | `string`                                                                    | Added to the outer `<span>`. Layout only.                       |
| others   | `<span>` attributes                                                         | Passed to the `<span>`.                                         |

`CitationSource` is exported as a type. The `citation` block's `source` has
the same fields, with an `id`.

## What it shows

- `JO 7110.65 BB` in a `<cite>`, then `3-7-2` after it.
- The place links to the source's `url`. With no `url`, it links to the
  attached file. With neither, it is plain text.
- With no `at`, only the source's name and edition.

## Looks

The browser's `<cite>` style (italic) for the source; the place is a
[`Link`](../Link/Link.md), so the `link` role and an underline. The size and
other colours are the text around it.

## Accessibility

- The source is a `<cite>`; the link is the place, read after it in the
  same phrase ("JO 7110.65 BB, 3-7-2, link").
- It is a `<span>`, so it fits in a sentence or a list item.
