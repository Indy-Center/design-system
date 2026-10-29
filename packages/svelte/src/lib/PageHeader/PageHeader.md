---
title: PageHeader
description: The top of an ordinary page, its h1 with a lead line under it and room for the page's actions on the right.
---

## Checklist

- [ ] Use it once, at the top of every page that isn't a home or landing
      page (those take `PageHero`).
- [ ] It renders the page's `h1` from `title`: don't put another `h1` in
      the page.
- [ ] The content is the lead line: one sentence on what the page is
      for, as plain text (a `Link` inside is fine). Leave it out rather
      than repeat the title.
- [ ] Put the page's own actions ("New event") in `actions`, as `Button`s.
      They sit on the right, and under the title on a phone.
- [ ] Don't colour or resize it with classes. `class` is for layout, such
      as the margin under it (`mb-8`).

## Use

```svelte
<script>
  import { Button, PageHeader } from "@indy-center/centerline-svelte";
</script>

<PageHeader title="Events" class="mb-8">
  Upcoming events in Indy Center, with positions to sign up for.
  {#snippet actions()}
    <Button href="/events/new">New event</Button>
  {/snippet}
</PageHeader>
```

## Props

| Prop       | Type               | Notes                                                                    |
| ---------- | ------------------ | ------------------------------------------------------------------------ |
| `title`    | `string`           | Required. The page's title: its `h1`.                                    |
| `children` | `Snippet`          | The lead line, in a `<p>`. Nothing renders without it.                   |
| `actions`  | `Snippet`          | Buttons or links for the page, on the right; under the title below `sm`. |
| `class`    | `string`           | Added after PageHeader's own classes. Layout only.                       |
| others     | `<div>` attributes | Passed to its box, such as `id`.                                         |

## Looks

As chosen in the surfaces prototype (ticket 10):

- The title: `Heading`'s look 1, `text-3xl` semibold in `font-heading`,
  `foreground`.
- The lead: `Text lead`, `text-lg` in `foreground-soft`, `mt-2` under the
  title.
- No eyebrow above the title and no rule under it.
- Actions on the right, bottom-aligned with the lead, from `sm` (640px)
  up; under the lead below it.

## Accessibility

- Renders a `<div>`, not `<header>`: outside `<main>` a header is the
  page's banner, and the site's `Header` is that.
- The title is an `<h1>`, the lead a `<p>` after it, the actions after
  both, so a reader meets them in that order.
