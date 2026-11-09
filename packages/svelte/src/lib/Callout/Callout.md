---
title: Callout
description: A tinted note set apart in a document, the FAA's NOTE, CAUTION, WARNING or REFERENCE, named by its label.
---

## Checklist

- [ ] Use it in a document (a lesson, a wiki page, an SOP) for a note
      the reader should see beside the text. For something about the
      page itself, such as a form that didn't save, use
      [`Alert`](../Alert/Alert.md): Callout is not announced, since a
      document's note isn't news.
- [ ] Pick the `level` by what it means, as the FAA does: `info` a NOTE,
      `caution` could cause a problem, `danger` a WARNING, `reference`
      where to read more (no colour).
- [ ] Give a `label` only when the level's own word ("Note", "Caution",
      "Warning", "Reference") says less than a short title would. The
      label replaces that word, on screen and for screen readers.
- [ ] Write the content as document text: paragraphs, a list, a link.
      In CMS rich text it is the `callout` block, drawn by
      [`RichText`](../RichText/RichText.md).
- [ ] Don't change its colours or icon. `class` is for layout only, such
      as a margin.

## Use

```svelte
<script>
  import { Callout } from "@indy-center/centerline-svelte";
</script>

<Callout level="caution">
  <p>Hold departures behind a heavy for two minutes.</p>
</Callout>

<Callout level="info" label="Wake turbulence">
  <p>The vortex sinks and drifts with the wind.</p>
</Callout>
```

## Props

| Prop       | Type                                             | Notes                                             |
| ---------- | ------------------------------------------------ | ------------------------------------------------- |
| `level`    | `"info" \| "caution" \| "danger" \| "reference"` | Required. Sets the icon, colours and label.       |
| `label`    | `string`                                         | Shown and read in place of the level's own label. |
| `children` | snippet                                          | The content: document text.                       |
| `class`    | `string`                                         | Added after Callout's own classes. Layout only.   |
| others     | `<aside>` attributes                             | Passed to the `<aside>`.                          |

The levels are `CALLOUT_LEVELS` from `@indy-center/centerline-svelte/blocks`,
for a CMS select.

## Looks

- Alert's tint: a wash (10%) and a faint border (40%) of the level's
  role: `info`, `warning` (for `caution`), `destructive` (for `danger`).
  `reference` has no colour: a `muted` wash (60%) and the `border` role.
- An MDI outline icon in the role's colour (`muted-foreground` for
  `reference`), a different shape for each level: a circled i, a
  triangle, an octagon, an open book. Colour is never the only signal.
- The label in `foreground`, semibold; the content in `foreground-soft`,
  at the document's size. Inside `Prose` the content keeps the prose
  styles (links, lists, bold), with no margin above its first part or
  below its last.
- In print, `prose.css` keeps a callout on one page.

## Accessibility

- It renders an `<aside>` named by its visible label (`aria-labelledby`),
  so readers list it as a complementary landmark: "Caution", or the
  custom label.
- It is not `role="alert"` or `status`: readers come to it as they read.
- The icon is hidden from readers; the label says the level.
