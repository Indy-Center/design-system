---
title: AppNav
description: An app's own navigation in the header, top-level links and one level of groups, the current page marked.
---

## Checklist

- [ ] It belongs in the header. The `Header` places it twice: as a `bar`
      from `lg` (1024px), and as a `menu` in the phone menu below that.
- [ ] Pass the app's pages as `items`: links, and groups of links. A
      group never holds another group. Keep the top level to a handful.
- [ ] Leave out links to other apps (the `AppsMenu` has them) and a "Home"
      that leads to the hub.
- [ ] An app's own admin, and anything else only some members see, go
      here, not in the user menu.
- [ ] Pass the page's path as `current` (`page.url.pathname`). The link it
      is, or is under, is marked; "/" only on itself.
- [ ] Use each page's own name for its link, a word or two.
- [ ] Don't colour it or change its sizes. It is dark in both schemes by
      itself. `class` is for layout only.

## Use

```svelte
<script>
  import { mdiCalendar, mdiHeadset, mdiHome } from "@mdi/js";
  import { page } from "$app/state";
  import { AppNav } from "@indy-center/svelte";

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
<AppNav {items} current={page.url.pathname} layout="menu" />
```

## Props

| Prop      | Type                | Notes                                                                                                 |
| --------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| `items`   | `NavItem[]`         | Required. Each `{ label, href, icon? }` (a `NavLink`) or `{ label, children, icon? }` (a `NavGroup`). |
| `current` | `string`            | The page's path. Marks the closest link it is, or is under. None if left out.                         |
| `layout`  | `"bar"` \| `"menu"` | `bar` (the default) for the header; `menu` for the phone menu.                                        |
| `label`   | `string`            | Names the `<nav>` for screen readers. `"Main"` by default.                                            |
| `class`   | `string`            | Added to the `<nav>`. Layout only.                                                                    |
| others    | `<nav>` attributes  | Passed to the `<nav>`: `id` and the rest.                                                             |

`icon` is an MDI path, such as `mdiCalendar` from `@mdi/js`. The types
`NavItem`, `NavLink` and `NavGroup` are exported beside it.

## Looks

- Dark in both schemes: it puts itself in the dark scope
  (`data-theme="dark"`), as the header around it.
- Links and group buttons are in the `link` colour, underlined on hover.
  The current page, and a group holding it, are on the soft fill
  (`foreground` at 10%) and underlined.
- `bar`: a row. A group's button has a chevron and opens its pages on a
  `card` panel with a `border` line, under the button.
- `menu`: one row each, full width. A group opens its pages in place,
  indented under it; the group holding the current page starts open.
- A `ring` outline on whatever is reached by keyboard.

## Accessibility

- It renders `<nav aria-label="Main">`, holding a list. When the `bar` and
  the `menu` are both on the page, only one shows at a time, so readers
  find one Main navigation.
- Groups are disclosures, not menus: a `<button aria-expanded>` and the
  list it shows. Tab moves through the links; Enter follows one.
- In the `bar`, Escape closes an open group and puts focus back on its
  button; a press outside, Tabbing out of it (so opening the next group
  by keyboard closes it), or following a link closes it too. In the
  `menu`, groups stay as the member left them; the phone menu around them
  closes on Escape.
- The current page's link has `aria-current="page"`.
- Every link, group button and row is at least 44px tall and wide.
