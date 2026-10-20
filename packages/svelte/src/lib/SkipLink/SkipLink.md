---
title: SkipLink
description: A "Skip to content" link, first on the page and hidden until it has keyboard focus.
---

## Checklist

- [ ] The `Header` places it (once `Header` ships); an app using `Header`
      adds nothing. Use it by itself only on a page without `Header`, as
      the first thing in `<body>`, so it is the first stop on Tab.
- [ ] Its text is always "Skip to content"; it takes no children.
- [ ] Give the page's main content `id="main"`, normally on `<main>`. If
      the content has another id, pass it as `href="#that-id"`.
- [ ] Keep one per page.
- [ ] Don't restyle it; `class` is for layout only.

## Use

```svelte
<script>
  import { SkipLink } from "@indy-center/svelte";
</script>

<!-- First in the page, before the site's navigation. -->
<SkipLink />

<nav>
  <!-- … -->
</nav>

<main id="main">
  <!-- … -->
</main>
```

## Props

| Prop    | Type             | Notes                                            |
| ------- | ---------------- | ------------------------------------------------ |
| `href`  | `string`         | The main content, as `#id`. `#main` by default.  |
| `class` | `string`         | Added after SkipLink's own classes. Layout only. |
| others  | `<a>` attributes | Passed to the `<a>`.                             |

## Looks

- Hidden (screen-reader only) until it has focus.
- With focus, it shows at the top left of the window, above everything: a
  `card` box with a `border` line, the text in the `link` role and
  underlined, and a `ring` outline. 44px tall.

## Accessibility

- It renders a plain `<a href="#main">`, the "bypass blocks" link WCAG
  2.4.1 asks for.
- Following it moves focus to the target as well as scrolling to it, so
  the next Tab goes on from the content, not the header. A target that
  can't take focus is given `tabindex="-1"` for this.
