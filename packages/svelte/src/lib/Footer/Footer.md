---
title: Footer
description: The page's footer, a map of links beside the logo, FAA disclaimer and copyright.
---

## Checklist

- [ ] Put one `Footer` at the bottom of every page, in the app's root
      layout, after `<main>` and outside it, so it is the page's
      `contentinfo` landmark.
- [ ] Pass the app's links as `columns`: a short heading over each column,
      a few links in each. Two or three columns read best; a fourth wraps.
- [ ] Which links every app shows waits on the privacy and accessibility
      pages. Until then, link what the app has, such as its other apps,
      contact and Discord. Leave out pages that don't exist yet rather than
      linking to nothing.
- [ ] Use each page's own name for its link.
- [ ] Don't change the disclaimer, the logo or the colours. The footer is
      dark in both schemes by itself. `class` is for layout only, such as a
      top margin.

## Use

```svelte
<script>
  import { Footer } from "@indy-center/centerline-svelte";

  const columns = [
    {
      heading: "Apps",
      links: [
        { href: "https://flyindycenter.com", label: "Community" },
        { href: "https://training.flyindycenter.com", label: "Training" },
      ],
    },
    {
      heading: "Help",
      links: [
        { href: "/contact", label: "Contact us" },
        { href: "https://discord.indy.center", label: "Discord" },
      ],
    },
  ];
</script>

<main>…</main>
<Footer {columns} />
```

## Props

| Prop      | Type                  | Notes                                                                                |
| --------- | --------------------- | ------------------------------------------------------------------------------------ |
| `columns` | `FooterColumn[]`      | Required. `{ heading: string; links: { href: string; label: string }[] }`, in order. |
| `label`   | `string`              | Names the map's `<nav>` for screen readers. `"Footer"` by default.                   |
| `class`   | `string`              | Added to the `<footer>`. Layout only.                                                |
| others    | `<footer>` attributes | Passed to the `<footer>`: `id` and the rest.                                         |

The types `FooterColumn` and `FooterLink` are exported beside it.

## Looks

- Dark in both schemes: the footer puts itself in the dark scope
  (`data-theme="dark"`), so it is the dark `background` with a `border`
  line on top, on a light page as on a dark one.
- From `md` (768px), the map takes the left two thirds and the logo with
  the disclaimer the right third. Below that they stack, the map first. The
  map is two columns on phones and three from `sm`.
- Column headings are small capitals in `muted-foreground`. Links are
  `foreground-soft`, turning `foreground` and underlined on hover.
- The logo is white (`foreground`). The disclaimer and copyright are small
  `muted-foreground` text in a quiet box with a `border` line.
- A `ring` outline on a link reached by keyboard.

## Accessibility

- It renders `<footer>`, which is the page's `contentinfo` landmark when it
  isn't inside `<main>`, `<article>`, `<aside>`, `<nav>` or `<section>`.
- The links are in a `<nav aria-label="Footer">`, each column an `<h2>`
  over a list, so readers announce the heading and how many links follow.
  If the page has another navigation named "Footer", pass another `label`.
- The logo is an image named "Indy Center".
- Each link is at least 44px tall and 44px wide.
- The copyright year is the year the page was drawn.
