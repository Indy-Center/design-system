---
title: EmptyState
description: What a page, panel or list shows when it has nothing in it, and what to do about it.
---

## Checklist

- [ ] Use it wherever a list, table or page can come back empty, instead
      of a blank panel. For a failed load, use `Alert`; for a page that
      isn't there, `ErrorPage`.
- [ ] `size="large"` (the default) when the empty thing is the page's or
      panel's main content; `size="inline"` for one line inside a list,
      table or menu that sits among other content.
- [ ] Large: `title` says what is missing ("No events scheduled"), in
      sentence case. Give `level` one below the heading it sits under: 2
      under the page's `h1`, 3 inside a panel titled with an `h2`.
- [ ] The text (required) says why it is empty or what happens next, in
      a sentence or two. Add an `action` (a `Button`) only when the member can fix it
      from here, such as "Add positions".
- [ ] Inline: one short sentence, such as "No sessions yet." A link in it
      is fine; it has no title, icon or action.
- [ ] Don't give it a surface or colours with classes: it takes the
      surface it sits on. `class` is for layout, such as margin.

## Use

```svelte
<script>
  import { Button, EmptyState, Icon } from "@indy-center/svelte";
  import { mdiAccountGroup, mdiPlus } from "@mdi/js";
</script>

<EmptyState title="No positions configured" level={2}>
  {#snippet icon()}<Icon path={mdiAccountGroup} />{/snippet}
  Add positions to this event to get started with controller assignments.
  {#snippet action()}
    <Button onclick={openModal}><Icon path={mdiPlus} />Add positions</Button>
  {/snippet}
</EmptyState>

<EmptyState size="inline">No sessions yet.</EmptyState>
```

## Props

| Prop       | Type                    | Notes                                                                                     |
| ---------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| `size`     | `"large" \| "inline"`   | `large` by default.                                                                       |
| `title`    | `string`                | Large: required. What is missing; the heading's text.                                     |
| `level`    | `2 \| 3 \| 4 \| 5 \| 6` | Large: required. The title's heading level. It always looks like Heading's look 3 (`lg`). |
| `icon`     | `Snippet`               | Large: an icon above the title, such as `Icon`; 30px at its default `1em`. Decorative.    |
| `children` | `Snippet`               | Required. Large: the text under the title. Inline: the line itself.                       |
| `action`   | `Snippet`               | Large: what to do, such as a `Button`, under the text. Optional.                          |
| `class`    | `string`                | Added to the box (large) or the paragraph (inline). Layout only.                          |
| others     | `<div>` / `<p>` attrs   | Passed to the same element, such as `id`.                                                 |

Large needs its text, so it always says why it is empty or what to do;
inline takes no `title`, `level`, `icon` or `action`. TypeScript flags
both.

## Looks

- Large: centred, with no fill or border of its own, so it sits on the
  page or inside a panel without a box in a box. The icon in
  `muted-foreground` on a `muted` circle; the title in `foreground`,
  `text-lg` semibold in `font-heading`; the text in `muted-foreground`,
  readable on the page and on a card in both schemes.
- Inline: `text-sm` in `muted-foreground`, as training's one-line empty
  panels. No padding: add it with `class` to line up with the rows.

## Accessibility

- Large renders a `<div>` with a real heading (`h2`–`h6`), so a screen
  reader can find the empty section by headings. Inline renders a `<p>`.
- The icon is `aria-hidden`: the title says the same.
- Neither is a live region. If the list empties while the member watches
  (after a filter), announce the change from the control that caused it.
