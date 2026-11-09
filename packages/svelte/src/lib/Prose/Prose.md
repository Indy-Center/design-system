---
title: Prose
description: Rich text from the CMS, such as a lesson plan's body, in the roles' colours and Heading's sizes.
---

## Checklist

- [ ] Use `Prose` for HTML you didn't write by hand: a CMS body, rendered
      Markdown. For text you write in Svelte, use `Heading`, `Text` and
      `Link`.
- [ ] The app's stylesheet needs `@tailwindcss/typography` and
      `@indy-center/centerline-tokens/prose.css` (see Use). Without them the text is
      unstyled.
- [ ] Don't add `prose-invert`, `prose-lg` or `prose-a:*`,
      `prose-headings:*` and the other modifiers: the colours follow
      `data-theme` by themselves, and links and headings keep `Link`'s
      and `Heading`'s looks over the modifiers.
- [ ] `as="article"` (the default) when the body is the page's document;
      `as="div"` when it is one part of a larger article.
- [ ] Start the body at `h2`: the page's `h1` is its title, outside
      `Prose`.
- [ ] `class` is for layout only. The width stays at the plugin's 65
      characters, which reads best; `max-w-none` lifts it.
- [ ] Wrap a part that must keep its own styles (a widget inside the
      body) in `not-prose`.

## Use

The app's stylesheet, after the tokens:

```css
@import "tailwindcss";
@import "@indy-center/centerline-tokens/tokens.css";
@import "@indy-center/centerline-tokens/theme.css";
@plugin "@tailwindcss/typography";
@import "@indy-center/centerline-tokens/prose.css";
```

The plugin is the app's own dependency:
`npm install -D @tailwindcss/typography`.

```svelte
<script>
  import { Prose } from "@indy-center/centerline-svelte";

  let { data } = $props();
</script>

<Prose>{@html data.lessonPlan.bodyHtml}</Prose>
```

Only pass `{@html}` HTML the app trusts, such as the CMS's own output.

## Props

| Prop       | Type                   | Notes                                          |
| ---------- | ---------------------- | ---------------------------------------------- |
| `as`       | `"article"` \| `"div"` | The element. Default `"article"`.              |
| `children` | `Snippet`              | The rich text, usually `{@html …}`.            |
| `class`    | `string`               | Added after Prose's own classes. Layout only.  |
| others     | element attributes     | Passed to the element: `id`, `aria-*`, `lang`. |

## Looks

`prose prose-centerline`: the typography plugin's spacing, on the roles.

- Body text `foreground-soft`; headings, bold text and code `foreground`;
  captions, list numbers and bullets `muted-foreground`.
- Headings at `Heading`'s sizes: h1 3xl, h2 xl, h3 lg, h4 to h6 base, all
  semibold in the heading font.
- Links as `Link` draws them: the `link` role, the body's weight,
  underlined at an offset, a thicker underline on hover, a `ring` outline
  from the keyboard.
- Inline code as a `muted` chip, without backticks. Code blocks on
  `muted`.
- Quotes upright, with a rule in the `info` role (the sky) and no quote
  marks.
- Tables: a `muted` head, and `border` lines, the head's too. A header
  cell down the side (`<th scope="row">`) is `foreground` and semibold. A
  table wider than the column scrolls in its own box.
- `<u>` in the text colour with a thin line, so it isn't taken for a link;
  `<s>` struck through.
- `[data-align="center" | "end" | "justify"]` aligns the element's text.
- A checklist (a `<ul>` of `<li><label><input type="checkbox"> …</label>`)
  has no bullet: the box sits beside the label's first line, and the whole
  row, at least 44px tall, ticks it.
- A link with `target="_blank"` has a mark after its text, in the link's
  colour, with the alternative text "opens in a new tab".

### Print

Black text on white whatever the scheme. A link to another site shows its
URL after the text, in place of the new-tab mark; checkboxes print empty;
a figure and a table row don't break across pages, nor does a callout;
code blocks wrap. `Header`, `Footer`, `AppNav`, the skip link and
a heading's anchor link are hidden.

## Accessibility

- It renders an `<article>` (a landmark readers can jump to) or a `<div>`,
  holding the HTML as given. The HTML's own headings, lists and tables
  carry its structure, so the CMS must write real ones.
- Links inside it are underlined, so they don't rely on colour alone (WCAG
  1.4.1), and show a focus outline.
