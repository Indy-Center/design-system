---
title: PageHero
description: The band at the top of a home or landing page, with the page's h1 on a gradient with a halftone of dots.
---

## Checklist

- [ ] Use it at the top of a home or landing page, full width, before the
      page's content. For any other page's title, use `PageHeader`.
- [ ] It renders the page's `h1` from `title`: don't put another `h1` in
      the page, or a heading in its content.
- [ ] Put a lead line, badges or buttons in its content. Write a lead with
      `Text`, not a coloured class: the content is in `foreground-soft`.
- [ ] `size="compact"` for a shorter band, such as a signed-in home page.
- [ ] Don't colour or resize it with classes. `class` is for layout, such
      as a margin under it.

## Use

```svelte
<script>
  import { Button, PageHero, Text } from "@indy-center/svelte";
</script>

<PageHero title="Welcome to Indy Center">
  <Text lead class="mx-auto max-w-3xl">
    An integrated pilot and controller community on the VATSIM network.
  </Text>
  <div class="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
    <Button href="https://discord.indy.center">Join our Discord</Button>
    <Button variant="secondary" href="/events">See events</Button>
  </div>
</PageHero>

<PageHero size="compact" title="Welcome, Jane" />
```

## Props

| Prop       | Type                       | Notes                                                                                                             |
| ---------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `title`    | `string`                   | Required. The page's title, rendered as its `h1` through `Heading`.                                               |
| `size`     | `"default"` \| `"compact"` | Room above and below the content. `default` by default: 64px on a phone, 80px from sm; `compact` 32px, then 40px. |
| `children` | `Snippet`                  | What goes under the title, centred. Optional.                                                                     |
| `class`    | `string`                   | Added after PageHero's own classes. Layout only.                                                                  |
| others     | `<div>` attributes         | Passed to the band, such as `id`.                                                                                 |

## Looks

As chosen in the surfaces prototype (ticket 10), it follows the scheme:

- A gradient from `card` at the top to `background` at the bottom
  (`#FFFFFF` to `#F1F5F9` in light, `#1E293B` to `#111827` in dark), so
  it fades into the page under it.
- The halftone: 1px dots every 20px, in `foreground` at 12% (dark dots on
  light, white dots on dark).
- The title: `Heading`'s look 1, semibold in `font-heading`, in
  `foreground`; `text-3xl` at every width, as `PageHeader`'s title.
- The content: centred, in `foreground-soft`, readable on both ends of
  the gradient, with or without a dot under it.
- No room for a header laid over the page: put it after the app's
  `Header`, which takes its own space.

## Accessibility

- Renders a `<div>` with the title as the page's `<h1>`, so the outline
  starts at the top of the page. It is not a landmark: the page's
  `<main>` should hold it.
- The dots are a background on an `aria-hidden` layer; nothing is read
  for them.
