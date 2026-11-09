---
title: RichText
description: Draws a Payload rich-text field's JSON as semantic HTML inside Prose, with components for its blocks.
---

## Checklist

- [ ] Use `RichText` for a Payload rich-text field sent as its JSON (the
      editor state), such as a lesson plan's body. For CMS HTML you
      trust, use `Prose` with `{@html}`.
- [ ] The app's stylesheet needs what `Prose` needs (see
      [Prose](../Prose/Prose.md)): `RichText` draws inside it.
- [ ] Pass `linkHref` to give internal links their addresses: it gets
      Payload's `{ relationTo, value }`, where `value` is the filled-in
      document, its id, or `null` once it is deleted. Return `undefined`
      for one with no page: its text is drawn plain, never `href="#"`.
- [ ] Have Payload fill in linked documents and uploads (`depth: 1` or
      more) with only the fields the page draws: an upload left as its id
      draws nothing.
- [ ] Give a block the package doesn't draw a snippet in `blocks`, by its
      slug. A snippet for one of the package's own slugs replaces it.
- [ ] Don't style what it writes with classes: the looks are `Prose`'s
      and the app's, on the elements and on `data-align`.
- [ ] Watch the console in development: an unknown node, or a block with
      no snippet, warns there.

## Use

```svelte
<script>
  import { RichText } from "@indy-center/centerline-svelte";

  let { data } = $props();
</script>

<RichText
  content={data.lessonPlan.body}
  linkHref={({ relationTo, value }) =>
    relationTo === "lesson-plans" && typeof value === "object" && value
      ? `/lesson-plans/${value.slug}`
      : undefined}
/>
```

An app's own block, with a snippet named for its slug:

```svelte
{#snippet phraseology({ words })}
  <p class="font-mono">{words}</p>
{/snippet}

<RichText content={data.page.body} blocks={{ phraseology }} />
```

A contents list reads the same headings, with the same ids:

```ts
import { documentHeadings } from "@indy-center/centerline-svelte";

const headings = documentHeadings(data.lessonPlan.body); // [{ level, text, id, node }]
```

## Props

| Prop        | Type                                             | Notes                                                                                     |
| ----------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `content`   | `RichTextState \| null \| undefined`             | Required. The field's value as Payload sends it. Nothing is drawn for `null`.             |
| `linkHref`  | `(doc: LinkDocument) => string \| undefined`     | An internal link's address. Without it, internal links are drawn as their text.           |
| `blocks`    | `BlockSnippets`                                  | A snippet per block slug, for blocks and inline blocks alike; one replaces the package's. |
| `headingId` | `(text: string, heading: HeadingNode) => string` | A heading's id, in place of `headingId`'s slug. `-2`, `-3` still go on a repeat.          |
| `as`        | `"article"` \| `"div"`                           | `Prose`'s element. Default `"article"`.                                                   |
| `class`     | `string`                                         | Added after `Prose`'s own classes. Layout only.                                           |
| others      | element attributes                               | Passed to `Prose`'s element: `id`, `aria-*`, `lang`.                                      |

## What it shows

Each of Lexical's own nodes as the element that fits it (decision 0010):

| Node                   | Drawn as                                                                                                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| paragraph              | `<p>`; an empty one draws nothing                                                                                                                                                                                                                                                    |
| text                   | its formats as `<strong>`, `<em>`, `<u>`, `<s>`, `<sub>`, `<sup>`, `<code>`; a line break as `<br>`                                                                                                                                                                                  |
| heading                | its `h2`–`h4` (the editor offers no others), with an id and an anchor link (below)                                                                                                                                                                                                   |
| list                   | `<ul>` or `<ol>` (with `start` when not 1); a nested list inside the item above it                                                                                                                                                                                                   |
| checklist              | a `<ul>` of `<label><input type="checkbox"> …</label>`. Readers can tick them; nothing is saved, and every box starts unticked, whatever the author left                                                                                                                             |
| quote, horizontal rule | `<blockquote>`, `<hr>`                                                                                                                                                                                                                                                               |
| table                  | `<table>`, its header rows in `<thead>`. Header cells are `<th scope="col">` (a header row's) or `<th scope="row">` (a header column's); merged cells keep `colspan` and `rowspan`. Lexical's widths and colours are dropped, and a cell's lone paragraph is drawn without its `<p>` |
| image upload           | one `<img>`: `src` the original, `srcset` its `thumbnail`, `large` and `banner` sizes and the original (each Payload made), `sizes` the reading column, the original's `width` and `height`, and its `alt`                                                                           |
| other upload           | a link to the file, named by its file name                                                                                                                                                                                                                                           |
| link                   | `<a href>`; a "new tab" one adds `target="_blank" rel="noopener noreferrer"`. An internal link's address is `linkHref`'s; with none, its text is drawn plain                                                                                                                         |
| block, inline block    | the snippet for its slug (below)                                                                                                                                                                                                                                                     |
| anything else          | its children, or nothing when it has none                                                                                                                                                                                                                                            |

- Alignment is `data-align="center"`, `"end"` or `"justify"`; left and
  start write nothing. Indent and Lexical's inline `style` are never
  written.
- A heading's id is a slug of its text: lower case, accents and
  apostrophes dropped, every other run of punctuation and spaces one
  hyphen ("Pilot's view" is `pilots-view`; one with no letters is
  `section`). A repeat gets `-2`, `-3` in document order, counting
  headings in blocks' content. `headingId` is the slug, exported for an
  app's own rule to build on.
- Each heading ends with a "link to this section": an `<a href="#id"
data-heading-anchor>` showing `#`, named "Link to section: <heading>".
  It shows on hover and keyboard focus, and not in print.
  [TableOfContents](../TableOfContents/TableOfContents.md) lists the same
  headings with the same ids.

## Blocks

A block or inline block is drawn by the snippet in `blocks` for its slug
(`fields.blockType`), or the package's own. Before the snippet gets them,
its fields lose `id`, `blockName` and `blockType`, and every `null`, at any
depth, becomes `undefined`. Its `content` field, nested rich text, arrives
drawn: a snippet to render, with the same `blocks`, `linkHref` and heading
ids. A slug with no snippet draws nothing, and warns in development.

The contract for Payload's block configs is the
`@indy-center/centerline-svelte/blocks` entry: plain TypeScript with no
Svelte import, so the CMS reads it without Svelte. It has each block's
field type (its component's props, a snippet prop as its JSON field), the
`BLOCKS` slugs, each `"block"` or `"inline"`, and the option lists its
selects need. Payload writes its configs from this table, by hand; the
package's type test checks each field type against its component's props,
so the two can't drift apart unseen.

```ts
import {
  BLOCKS,
  type BlockFieldTypes,
} from "@indy-center/centerline-svelte/blocks";
```

| Slug             | Kind   | Fields                                                                                                               | Component                                   | Needs                                                                                            |
| ---------------- | ------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `airport`        | inline | `airport` (`{ code, name? }`), `nameAt?` (`AIRPORT_NAME_AT`), `focusable?`                                           | `Airport`                                   |                                                                                                  |
| `callout`        | block  | `level` (select, `CALLOUT_LEVELS`), `label` (text, optional), `content` (rich text)                                  | [`Callout`](../Callout/Callout.md)          |                                                                                                  |
| `citation`       | inline | `source` (relationship to a source, populated with `id`, `name`, `edition`, `url` and the file's `url`), `at` (text) | [`Citation`](../Citation/Citation.md)       |                                                                                                  |
| `disclosure`     | block  | `summary` (text), `content` (rich text)                                                                              | [`Disclosure`](../Disclosure/Disclosure.md) |                                                                                                  |
| `flightCategory` | inline | `category` (`FLIGHT_CATEGORIES`), `focusable?`                                                                       | `FlightCategory`                            |                                                                                                  |
| `frequency`      | inline | `value?` (megahertz as text), `callsign?`; `value` wins                                                              | `Frequency`                                 | `setPositions`, for a `callsign`                                                                 |
| `position`       | inline | `callsign`, `show?` (`POSITION_FIELDS`), `airportAt?` (`POSITION_AIRPORT_AT`), `airport?` (`{ code?, name? }`)       | `Position`, always `layout="inline"`        | `setPositions`: a callsign it doesn't know is drawn as the callsign. `airport: {}` is no airport |
| `rating`         | inline | `rating` (a short code: `CONTROLLER_RATING_CODES`, `PILOT_RATING_CODES`), `kind?` (`RATING_KINDS`), `focusable?`     | `Rating`                                    |                                                                                                  |
| `time`           | inline | `value`, `end?`: Zulu times of day as four digits (`"2300"`)                                                         | `Time` with `show="daily"`                  |                                                                                                  |

A slug with no row here is an app's own: it gives that slug a snippet. A
snippet types its argument with `BlockProps<Fields>`. The inline blocks
sit in the sentence with no spacing of their own.

## Looks

`Prose`'s; see [Prose](../Prose/Prose.md). The blocks keep their own
components' looks.

## Accessibility

- Its elements carry the document's structure: headings, lists, tables
  with header cells and scopes, an image's `alt`. The CMS must use real
  ones; Payload's editor offers no others.
- Each checklist box is named by its label, and toggles with Space; it is
  a reader's own tick, saved nowhere.
- A new-tab link is marked by `Prose` (with text for screen readers), not
  by `RichText`.
