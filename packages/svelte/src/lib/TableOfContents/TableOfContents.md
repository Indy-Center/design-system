---
title: TableOfContents
description: A list of links to a document's h2 and h3 headings, read from the same JSON RichText draws.
---

## Checklist

- [ ] Use `TableOfContents` beside a `RichText` page, with the same
      `content`. It reads the headings from the JSON, so it works with no
      script.
- [ ] If `RichText` gets your own `headingId`, give `TableOfContents` the
      same one: both take their ids from `documentHeadings`, so the links
      then match the headings.
- [ ] Put it before the document or beside it, outside the `RichText`.
- [ ] Don't colour it or change its sizes. `class` is for layout only, such
      as a margin.
- [ ] Leave it out of a short document: with no `h2` or `h3` it draws
      nothing.

## Use

```svelte
<script>
  import { RichText, TableOfContents } from "@indy-center/centerline-svelte";

  let { data } = $props();
</script>

<TableOfContents content={data.lessonPlan.body} />
<RichText content={data.lessonPlan.body} />
```

## Props

| Prop        | Type                                             | Notes                                                               |
| ----------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| `content`   | `RichTextState \| null \| undefined`             | Required. The same field `RichText` draws.                          |
| `headingId` | `(text: string, heading: HeadingNode) => string` | The same function given to `RichText`. Default: the package's slug. |
| `label`     | `string`                                         | The landmark's name. Default `"Contents"`.                          |
| `class`     | `string`                                         | Layout only.                                                        |
| others      | element attributes                               | Passed to the `<nav>`.                                              |

## What it shows

A `<nav>` with an ordered list of the document's `h2` headings, each
followed by a nested list of the `h3` headings after it. Deeper headings
are left out. An `h3` before any `h2` stands at the top. Headings inside
blocks' content are counted, as `RichText` counts them.

## Looks

- Small text (`text-sm`); each entry is a [Link](../Link/Link.md), so the
  `link` role (Sky in light, `#38BDF8` in dark), underlined, with a
  `ring` outline when reached by keyboard.
- The `h3` entries are indented under their `h2`.
- No frame or colour of its own.

## Accessibility

- A `<nav aria-label="Contents">` landmark, so it can be found among the
  page's other navigations.
- Each link is at least 44px tall.
- The links are plain `#id` links: no script, and the browser moves
  focus to the section.
