---
title: Breadcrumbs
description: The pages above this one, as a trail of links back up.
---

## Checklist

- [ ] Use `Breadcrumbs` on pages that sit deep in a hierarchy, such as a
      library document (Library › SOPs › ZID Center SOP). Leave it off pages
      one step from the top, where the header is enough.
- [ ] List the pages from the top down, ending with the page being shown.
      The last one is marked as the current page by itself.
- [ ] Use each page's own title, shortened if it is long.
- [ ] Put it above the page's `<h1>`, outside the header.
- [ ] Don't colour it or change its sizes. `class` is for layout only, such
      as a margin.

## Use

```svelte
<script>
  import { Breadcrumbs } from "@indy-center/centerline-svelte";
</script>

<Breadcrumbs
  items={[
    { href: "/", label: "Library" },
    { href: "/sops", label: "SOPs" },
    { href: "/sops/zid-center", label: "ZID Center SOP" },
  ]}
/>
```

## Props

| Prop    | Type                                | Notes                                                               |
| ------- | ----------------------------------- | ------------------------------------------------------------------- |
| `items` | `{ href: string; label: string }[]` | Required. From the top down, ending with this page. Type `Crumb`.   |
| `label` | `string`                            | Names the navigation for screen readers. `"Breadcrumb"` by default. |
| `class` | `string`                            | Added to the `<nav>`. Layout only.                                  |
| others  | `<nav>` attributes                  | Passed to the `<nav>`: `id` and the rest.                           |

## Looks

- Small text. The pages above are links: the `link` role, underlined.
- The page being shown is in `foreground-soft`, not underlined.
- A small chevron in `muted-foreground` between crumbs.
- On a narrow screen the trail wraps onto more lines.
- A `ring` outline when reached by keyboard.

## Accessibility

- It renders `<nav aria-label="Breadcrumb">` holding an `<ol>` of links, so
  readers announce a breadcrumb navigation and how many crumbs it has.
- The last link has `aria-current="page"`.
- The chevrons are hidden from screen readers, so nothing is read between
  crumbs.
- Each crumb is at least 44px tall and wide.
