---
title: Pagination
description: Buttons to move between the pages of a long list, the current page filled.
---

## Checklist

- [ ] Use `Pagination` under a list or table split into pages, such as a
      member's session history. For a short list, show it all instead.
- [ ] Bind the page (`bind:page`) and show that page's rows; or pass `page`
      and handle `onchange`, for example to load the page from the server.
- [ ] Keep the URL in step when a member should be able to share or reload
      a page: set `?page=` in `onchange`.
- [ ] Give it a `label` when a page has two lists with pagination, so
      screen readers can tell them apart ("Session pages").
- [ ] Don't colour it or change its sizes. `class` is for layout only, such
      as a margin or centring.

## Use

```svelte
<script>
  import { Pagination } from "@indy-center/svelte";

  let { data } = $props();
  let page = $state(1);
  const perPage = 20;
  const shown = $derived(
    data.sessions.slice((page - 1) * perPage, page * perPage),
  );
</script>

<!-- the rows in `shown` -->

<Pagination
  bind:page
  pageCount={Math.ceil(data.sessions.length / perPage)}
  class="mt-4 justify-center"
/>
```

## Props

| Prop        | Type                     | Notes                                                                    |
| ----------- | ------------------------ | ------------------------------------------------------------------------ |
| `pageCount` | `number`                 | Required. How many pages. Nothing renders for one or none.               |
| `page`      | `number`                 | The page shown, from 1. `1` by default; bindable.                        |
| `onchange`  | `(page: number) => void` | Called with the new page when the member moves to one.                   |
| `label`     | `string`                 | Names the navigation for screen readers. `"Pagination"` by default.      |
| `class`     | `string`                 | Added to the `<nav>`, a flex row. Layout only, such as `justify-center`. |
| others      | `<nav>` attributes       | Passed to the `<nav>`: `id` and the rest.                                |

## Looks

- The current page is filled with the `primary` role, its number in
  `primary-foreground` and semibold. The fill marks it, not colour alone.
- The other pages, previous and next are in `foreground-soft`, on a `muted`
  fill when hovered.
- Previous and next are dimmed at the ends.
- With many pages it shows the first and last, the pages beside the current
  one, and "…" for the rest, so the row fits a phone.
- A `ring` outline when reached by keyboard.

## Accessibility

- It renders `<nav aria-label="Pagination">` holding buttons. Tab moves
  through them; Enter or Space moves to a page.
- Each page button is named "Page 3", and the current one has
  `aria-current="page"`, so readers say "Page 3, current page".
- Previous and next are named "Previous page" and "Next page", and are
  disabled at the ends. When one turns disabled under the member's focus,
  focus moves to the page they reached.
- The "…" is hidden from screen readers; the page names around it say what
  is skipped.
- Every button is at least 44px tall and wide.
- The buttons change the page without moving focus to the list. Keep the
  list's heading or count where it says which page is shown.
