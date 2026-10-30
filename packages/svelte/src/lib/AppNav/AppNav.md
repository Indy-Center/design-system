---
title: AppNav
description: An app's own navigation in the header, top-level links and one level of groups, the current page marked; AppNavMenu is its phone version.
---

## Checklist

- [ ] It belongs in the header. The `Header` places both: `AppNav`, the
      bar, from `lg` (1024px), and `AppNavMenu` in the phone menu below
      that.
- [ ] Pass both the same `items`: the app's pages, as links and groups of
      links. A group never holds another group. Keep the top level to a
      handful.
- [ ] Leave out links to other apps (the `AppsMenu` has them) and a "Home"
      that leads to the hub.
- [ ] An app's own admin, and anything else only some members see, go
      here, not in the user menu.
- [ ] Pass the page's path as `current` (`page.url.pathname`). The link it
      is, or is under, is marked; "/" only on itself. A trailing slash
      on the path or a link doesn't count: `/events/` is `/events`.
- [ ] Use each page's own name for its link, a word or two.
- [ ] Don't colour them or change their sizes. They are dark in both
      schemes by themselves. `class` is for layout only.

## Use

```svelte
<script>
  import { mdiCalendar, mdiHeadset, mdiHome } from "@mdi/js";
  import { page } from "$app/state";
  import { AppNav, AppNavMenu } from "@indy-center/centerline-svelte";

  const items = [
    { label: "Home", href: "/", icon: mdiHome },
    { label: "Events", href: "/events", icon: mdiCalendar },
    {
      label: "Controlling",
      icon: mdiHeadset,
      children: [
        { label: "Roster", href: "/roster" },
        { label: "Join Indy Center", href: "/visit" },
      ],
    },
  ];
</script>

<AppNav {items} current={page.url.pathname} />
<AppNavMenu {items} current={page.url.pathname} />
```

## Props

### AppNav

| Prop      | Type               | Notes                                                                                                 |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `items`   | `NavItem[]`        | Required. Each `{ label, href, icon? }` (a `NavLink`) or `{ label, children, icon? }` (a `NavGroup`). |
| `current` | `string`           | The page's path. Marks the closest link it is, or is under. None if left out.                         |
| `label`   | `string`           | Names the `<nav>` for screen readers. `"Main"` by default.                                            |
| `class`   | `string`           | Added to the `<nav>`. Layout only.                                                                    |
| others    | `<nav>` attributes | Passed to the `<nav>`: `id` and the rest, but not `aria-label`; `label` names it.                     |

### AppNavMenu

| Prop      | Type               | Notes                                                                                                 |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `items`   | `NavItem[]`        | Required. Each `{ label, href, icon? }` (a `NavLink`) or `{ label, children, icon? }` (a `NavGroup`). |
| `current` | `string`           | The page's path. Marks the closest link it is, or is under, and opens the group holding it.           |
| `label`   | `string`           | Names the `<nav>` for screen readers. `"Main"` by default.                                            |
| `class`   | `string`           | Added to the `<nav>`. Layout only.                                                                    |
| others    | `<nav>` attributes | Passed to the `<nav>`: `id` and the rest, but not `aria-label`; `label` names it.                     |

`icon` is an MDI path, such as `mdiCalendar` from `@mdi/js`. The types
`NavItem`, `NavLink` and `NavGroup` are exported beside them.

## Looks

- Dark in both schemes: each puts itself in the dark scope
  (`data-theme="dark"`), as the header around it.
- Links and group buttons are in `foreground-soft`, turning `foreground`
  on the soft fill (`foreground` at 10%) on hover, never underlined. The
  current page, and a group holding it, are in `foreground` on the soft
  fill.
- `AppNav`: a row. A group's button has a chevron and opens its pages on a
  `card` panel with a `border` line, under the button.
- `AppNavMenu`: one row each, full width. A group opens its pages in
  place, indented under it; the group holding the current page starts
  open.
- A `ring` outline on whatever is reached by keyboard.

## Accessibility

- Each renders `<nav aria-label="Main">`, holding a list. With both on the
  page, only one shows at a time, so readers find one Main navigation.
- Groups are disclosures, not menus: a `<button aria-expanded>` and the
  list it shows. Tab moves through the links; Enter follows one.
- In `AppNav`, Escape closes an open group and puts focus back on its
  button; a tap outside (not a scroll), Tabbing out of it (so opening the
  next group by keyboard closes it), or following a link closes it too.
  In `AppNavMenu`, groups stay as the member left them; the phone menu
  around them closes on Escape.
- The current page's link has `aria-current="page"`.
- Every link, group button and row is at least 44px tall and wide.
