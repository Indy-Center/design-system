---
title: Text
description: Text that differs from body text, as a lead line, muted or small, in the roles' colours.
---

## Checklist

- [ ] Write plain body text as a plain `<p>`: `base.css` gives it the body
      colour and font (arriving in this release). Use `Text` only for
      what differs from it.
- [ ] `lead` for the opening line under a page's title; `tone="muted"` for
      captions and fine print, such as "Last updated"; `size="small"` for
      hints and sub-lines.
- [ ] `lead` stands alone: don't add `tone` or `size` to it.
- [ ] Set `as="span"` inside a line of text, `as="div"` around other
      blocks; a paragraph otherwise.
- [ ] Don't colour or resize it with classes, and don't reach for a
      smaller size: there is no `xs`. `class` is for layout only.
- [ ] A form field's hint belongs in `Field`'s `hint`, not a `Text` beside
      the control.

## Use

```svelte
<script>
  import { Heading, Text } from "@indy-center/svelte";
</script>

<Heading level={1}>Events</Heading>
<Text lead>What's on at Indianapolis Center this month.</Text>

<p>Sign up for a slot by Friday.</p>
<Text size="small">Times are in your own time zone.</Text>
```

## Props

| Prop       | Type                     | Notes                                                     |
| ---------- | ------------------------ | --------------------------------------------------------- |
| `as`       | `"p" \| "span" \| "div"` | The element. `"p"` by default.                            |
| `lead`     | `boolean`                | The opening line under a page title. Not with the others. |
| `tone`     | `"muted"`                | Captions and fine print.                                  |
| `size`     | `"small"`                | Hints and sub-lines; muted too.                           |
| `children` | `Snippet`                | The text.                                                 |
| `class`    | `string`                 | Added after Text's own classes. Layout only.              |
| others     | element attributes       | Passed to the element.                                    |

## Looks

| Look           | Size      | Colour             |
| -------------- | --------- | ------------------ |
| none           | inherited | inherited          |
| `lead`         | `text-lg` | `foreground-soft`  |
| `tone="muted"` | inherited | `muted-foreground` |
| `size="small"` | `text-sm` | `muted-foreground` |

With no look, Text sets nothing and follows what it sits in. `muted` keeps
the size around it, so muted text in a small card stays small.

## Accessibility

- Renders a `<p>` by default, which readers treat as a paragraph; `span`
  and `div` carry no meaning of their own.
- `muted-foreground` meets 4.5:1 on `background` and `card` in both
  schemes, so muted and small text stay readable.
