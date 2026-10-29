---
title: ErrorPage
description: The page an app shows for a missing page or a failed load, with a way home and back.
---

## Checklist

- [ ] Use it as the whole of the app's `src/routes/+error.svelte`, passing
      SvelteKit's `page` state. For an error inside a page that still
      works, use `Alert`; for an empty list, `EmptyState`.
- [ ] Pass `status`, `message` and `path` from `page`. Throw a 404 with a
      message that names what is missing (`error(404, "Partner not
found")`): it becomes the title.
- [ ] Set `home` when the app's home isn't `/`.
- [ ] Give `links` the app's two to four main pages, so a missing page
      isn't a dead end. They show on a 404 only.
- [ ] Set the page's `<title>` yourself, in the app's own pattern.
- [ ] Don't restyle it or change its wording with classes. `class` is for
      layout.

## Use

```svelte
<!-- src/routes/+error.svelte -->
<script>
  import { page } from "$app/state";
  import { ErrorPage } from "@indy-center/centerline-svelte";
  import { mdiAccountGroup, mdiCalendar } from "@mdi/js";
</script>

<svelte:head>
  <title>Indy Center | {page.status}</title>
</svelte:head>

<ErrorPage
  status={page.status}
  message={page.error?.message}
  path={page.url.pathname}
  links={[
    { label: "Events", href: "/events", icon: mdiCalendar },
    { label: "Roster", href: "/roster", icon: mdiAccountGroup },
  ]}
/>
```

## Props

| Prop      | Type              | Notes                                                                                   |
| --------- | ----------------- | --------------------------------------------------------------------------------------- |
| `status`  | `number`          | Required. `page.status`; shown large above the title. 404 is a missing page.            |
| `message` | `string`          | `page.error?.message`. On a 404 it is the title, unless it's SvelteKit's own.           |
| `path`    | `string`          | `page.url.pathname`. Shown under the text on a 404.                                     |
| `home`    | `string`          | Where “Return home” goes. `/` by default.                                               |
| `links`   | `ErrorPageLink[]` | `{ label, href, icon? }`, `icon` an MDI path. Offered under a rule on a 404 only.       |
| `class`   | `string`          | Added to the box. It is `flex-1`, so in a column layout it fills the space and centres. |
| others    | `<div>` attrs     | Passed to the box, such as `id`.                                                        |

## Server and browser

The server draws “Return home” alone. Once the page loads, “Go back”
joins it if the tab has a page to go back to (`history.length > 1`); a
tab opened on the broken link has none, and without JavaScript it never
shows.

## Looks

Lifted from the community site's error page, on the roles:

- A circle in `primary` at 15% with the icon in `link`: a radar on a
  404, an alert otherwise.
- The status in `font-mono`, `text-7xl` (`8xl` from `sm`), clipped to a
  `foreground` → `muted-foreground` gradient.
- The title through `Heading` at level 1, look 1 (`3xl`): "Radar contact
  lost" on a 404 (or the load's message), "Something went wrong"
  otherwise.
- The text in `muted-foreground`; on other errors it is the error's
  message and "Please try again in a moment."
- The path in `font-mono` `text-sm`, `foreground-soft` on `muted`, cut
  short with an ellipsis if it is too long.
- “Return home” a primary `Button`, “Go back” a secondary one.
- The other pages in `foreground-soft`, `muted` behind them on hover,
  under a `border` rule and a small uppercase label.

## Accessibility

- The title is the page's one `h1`; nothing else is a heading.
- “Return home” is a link and “Go back” a button that runs
  `history.back()`, shown only when there is a page to go back to. Both
  are 44px tall and come in that order from the keyboard.
- The other pages are a `<nav>` named "Or try one of these", a list of
  links; their icons are hidden from screen readers.
- The icon circle is `aria-hidden`. The status is read as text.
