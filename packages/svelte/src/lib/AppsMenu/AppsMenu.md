---
title: AppsMenu
description: The header's Apps button and the list of Indy Center apps it opens, the current app marked.
---

## Checklist

- [ ] It belongs in the header, at its right, before the user menu. The
      `Header` places it; an app doesn't place it by itself.
- [ ] Pass every Indy Center app as `apps`, in the same order in every
      app, and the `href` of the app the page is in as `current`.
- [ ] Give each app its own name ("Training") and a few words on what it
      holds. Link its home page.
- [ ] Links between apps open in the same tab: don't add `target`.
- [ ] Don't colour it or change its sizes. It is dark in both schemes by
      itself. `class` is for layout only, such as a margin.

## Use

```svelte
<script>
  import { mdiBookOpenVariant, mdiHome, mdiSchool } from "@mdi/js";
  import { AppsMenu } from "@indy-center/svelte";

  const apps = [
    {
      href: "https://flyindycenter.com",
      name: "Indy Center",
      description: "Events, roster, staff, feedback",
      icon: mdiHome,
    },
    {
      href: "https://training.flyindycenter.com",
      name: "Training",
      description: "Your training, sessions, certifications",
      icon: mdiSchool,
    },
    {
      href: "https://library.flyindycenter.com",
      name: "Library",
      description: "Courses for pilots and controllers",
      icon: mdiBookOpenVariant,
    },
  ];
</script>

<AppsMenu {apps} current="https://training.flyindycenter.com" />
```

## Props

| Prop      | Type               | Notes                                                                                      |
| --------- | ------------------ | ------------------------------------------------------------------------------------------ |
| `apps`    | `App[]`            | Required. `{ href: string; name: string; description?: string; icon?: string }`, in order. |
| `current` | `string`           | The `href` of the app this page is in. None marked if left out.                            |
| `class`   | `string`           | Added to its root `<div>`. Layout only.                                                    |
| others    | `<div>` attributes | Passed to its root `<div>`: `id` and the rest.                                             |

`icon` is an MDI path, such as `mdiSchool` from `@mdi/js`. The type `App`
is exported beside it.

## Looks

- Dark in both schemes: it puts itself in the dark scope
  (`data-theme="dark"`), as the header around it.
- The button is a grid icon and "Apps" in `foreground-soft`, on the soft
  fill (`foreground` at 10%) on hover. Below `sm` (640px) only the icon
  shows.
- The list opens on a `card` panel with a `border` line, lined up with the
  button's right edge. Below `sm` it spans the screen under a 64px header.
- Each app's name is in the `link` colour, underlined on hover, with its
  description in small `muted-foreground` text under it.
- The current app is on the soft fill and underlined.
- A `ring` outline on whatever is reached by keyboard.

## Accessibility

- A disclosure, not a menu: a `<button aria-expanded>` named "Apps", and
  the list of links it shows. Tab moves into the list and through it;
  Enter follows a link.
- Escape closes the list and puts focus back on the button. A press
  outside it, or following one of its links, closes it too.
- The current app's link has `aria-current="true"`: it is the app, not
  the page.
- The button and every row are at least 44px tall and wide.
