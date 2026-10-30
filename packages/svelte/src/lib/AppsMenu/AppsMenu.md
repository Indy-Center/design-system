---
title: AppsMenu
description: The header's Apps button and the list of Indy Center apps it opens, the current app marked.
---

## Checklist

- [ ] It belongs in the header, at its right, before the user menu. The
      `Header` places it; an app doesn't place it by itself.
- [ ] Pass `INDY_CENTER_APPS` as `apps`, so every app lists the same
      apps in the same order, and the `href` of the app the page is in as
      `current`.
- [ ] An app that needs its own list passes it instead: each app with its
      own name ("Training") and a few words on what it holds, linking its
      home page.
- [ ] Links between apps open in the same tab: don't add `target`.
- [ ] Don't colour it or change its sizes. It is dark in both schemes by
      itself. `class` is for layout only, such as a margin.

## Use

```svelte
<script>
  import { AppsMenu, INDY_CENTER_APPS } from "@indy-center/centerline-svelte";
</script>

<AppsMenu
  apps={INDY_CENTER_APPS}
  current="https://training.flyindycenter.com"
/>
```

## Props

| Prop      | Type               | Notes                                                                                                     |
| --------- | ------------------ | --------------------------------------------------------------------------------------------------------- |
| `apps`    | `readonly App[]`   | Required. `{ href: string; label: string; description?: string; icon?: string }`, in order.               |
| `current` | `string`           | The `href` of the app this page is in; a trailing slash on either doesn't count. None marked if left out. |
| `class`   | `string`           | Added to its root `<div>`. Layout only.                                                                   |
| others    | `<div>` attributes | Passed to its root `<div>`: `id` and the rest.                                                            |

`icon` is an MDI path, such as `mdiSchool` from `@mdi/js`. The type `App`
is exported beside it.

`INDY_CENTER_APPS` lists Indy Center (flyindycenter.com), Training,
Library and Charts, each with a description and an icon.

## Looks

- Dark in both schemes: it puts itself in the dark scope
  (`data-theme="dark"`), as the header around it.
- The button is a grid icon and "Apps" in `foreground-soft`, on the soft
  fill (`foreground` at 10%) on hover. Below `sm` (640px) only the icon
  shows.
- The list opens on a `card` panel with a `border` line, lined up with the
  button's right edge. Below `sm` it spans the screen under a 64px header.
- Each app's name is in `foreground-soft`, turning `foreground` on the
  soft fill on hover, never underlined, with its description in small
  `muted-foreground` text under it.
- The current app is in `foreground` on the soft fill.
- A `ring` outline on whatever is reached by keyboard.

## Accessibility

- A disclosure, not a menu: a `<button aria-expanded>` named "Apps", and
  the list of links it shows. Tab moves into the list and through it;
  Enter follows a link.
- Escape closes the list and puts focus back on the button. A tap outside
  it (not a scroll, so a phone can scroll the page under it), Tabbing out
  of it, or following one of its links closes it too.
- The current app's link has `aria-current="true"`: it is the app, not
  the page.
- The button and every row are at least 44px tall and wide.
