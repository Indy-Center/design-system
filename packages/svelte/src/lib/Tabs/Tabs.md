---
title: Tabs
description: Links between the pages of one section, the current one marked.
---

## Checklist

- [ ] Use `Tabs` to move between the pages of one section, such as an
      admin area's Users, Events and Feedback. Each tab is its own page
      with its own URL.
- [ ] To switch panels on one page without leaving it, `Tabs` is the wrong
      component: those are content tabs, which belong to the documents
      feature.
- [ ] Give it a `label` naming the section ("Admin"), so screen readers can
      tell this navigation from the header's.
- [ ] Pass the `href` of the tab for the page being shown as `current`,
      worked out from the URL (`page.url.pathname`). On a page outside the
      tabs, leave it out and no tab is marked.
- [ ] Keep tab labels to a word or two.
- [ ] Don't colour it or change its sizes. `class` is for layout only, such
      as a margin.

## Use

```svelte
<script>
  import { page } from "$app/state";
  import { Tabs } from "@indy-center/svelte";

  const sections = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/feedback", label: "Feedback" },
  ];
</script>

<Tabs label="Admin" items={sections} current={page.url.pathname} />
```

## Props

| Prop      | Type                                | Notes                                                       |
| --------- | ----------------------------------- | ----------------------------------------------------------- |
| `label`   | `string`                            | Required. Names the navigation for screen readers.          |
| `items`   | `{ href: string; label: string }[]` | Required. The tabs, in order. Type `Tab`.                   |
| `current` | `string`                            | The `href` of the tab for the page shown. None if left out. |
| `class`   | `string`                            | Added to the `<nav>`. Layout only.                          |
| others    | `<nav>` attributes                  | Passed to the `<nav>`: `id` and the rest.                   |

## Looks

- A row of tabs over a `border` line.
- The current tab has a 2px bar under it in the `link` role, and semibold
  text in `foreground`. The bar and the weight mark it, not colour alone.
- The others are in `muted-foreground`, turning `foreground` on hover.
- On a narrow screen the row scrolls sideways rather than wrapping. It
  takes its width from its container, not its tabs, so it never pushes a
  page wider than the screen; in a flex row beside other things, give it
  room with `class="flex-1"`.
- A `ring` outline, drawn inside the tab, when reached by keyboard.

## Accessibility

- It renders `<nav aria-label="…">` holding a list of links. Tab moves
  through them and Enter follows one; there are no arrow keys, since these
  are links, not the ARIA tabs pattern.
- The current tab has `aria-current="page"`, so readers say "current page".
- Each tab is at least 44px tall and wide.
