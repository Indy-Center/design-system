---
title: Header
description: The page's header, with the skip link, the logo to the hub, the app's name to its home, the app's navigation, the menu of apps and the user menu or Sign in.
---

## Checklist

- [ ] Put one `Header` at the top of every page, in the app's root
      layout, before `<main>` and outside it, so it is the page's `banner`
      landmark. It takes its own 64px at the top of the page and stays
      there as the page scrolls: don't lay it over the page or place
      content under it.
- [ ] Give the page `scroll-padding-top: 4rem` (`scroll-pt-16` on
      `<html>`), so a link to `#id`, or a control Tabbed to, scrolls into
      view below the header, not under it.
- [ ] Give the page's main content `id="main"`, normally on `<main>`. The
      header's skip link goes there; pass `skipTo` for another id.
- [ ] Pass the app this page is in as `app`, from `INDY_CENTER_APPS`. On
      the hub, leave it out: the logo shows alone.
- [ ] Pass the app's pages as `nav` and the page's path as `current`. An
      app's own items, such as its admin, go here, not in the user menu.
- [ ] Pass the signed-in member as `member`; leave it out when nobody is
      signed in, and Sign in shows instead. Give both `signInHref` and
      `signOutHref`, identity's addresses with the page to come back to.
- [ ] Don't add `SkipLink`, `AppNav`, `AppNavMenu`, `AppsMenu` or
      `UserMenu` yourself: the header places them.
- [ ] Title each page page first, `<Page> | <App> | Indy Center`; on
      the hub, `<Page> | Indy Center` (see Page titles below).
- [ ] Don't colour it or change its sizes. It is dark in both schemes by
      itself. `class` is for layout only.

## Use

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from "$app/state";
  import { Footer, Header, INDY_CENTER_APPS } from "@indy-center/centerline-svelte";
  import { mdiCalendar, mdiHome } from "@mdi/js";

  let { data, children } = $props();

  const nav = [
    { label: "Home", href: "/", icon: mdiHome },
    { label: "Sessions", href: "/sessions", icon: mdiCalendar },
  ];

  // Identity signs in and out on a GET and needs the page to come back to.
  const back = $derived(encodeURIComponent(page.url.href));
</script>

<Header
  app={INDY_CENTER_APPS.find((app) => app.label === "Training")}
  {nav}
  current={page.url.pathname}
  member={data.member}
  signInHref="https://auth.flyindycenter.com/login?return_url={back}"
  signOutHref="https://auth.flyindycenter.com/logout?return_url={back}"
/>
<main id="main">{@render children()}</main>
<Footer columns={…} />
```

`data.member` is `{ name, cid, rating, pilotRating }`, or `undefined`
when nobody is signed in.

## Props

| Prop          | Type                  | Notes                                                                                                                                                                                                  |
| ------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app`         | `App`                 | The app this page is in, as `INDY_CENTER_APPS` lists it: its `label` and `href` (its home). Left out on the hub.                                                                                       |
| `nav`         | `NavItem[]`           | The app's pages and groups, as `AppNav` takes them. Left out or empty, there is no navigation and no Menu button.                                                                                      |
| `current`     | `string`              | The page's path, such as `page.url.pathname`. Marks the current page in `nav`.                                                                                                                         |
| `apps`        | `readonly App[]`      | The apps in the Apps menu. `INDY_CENTER_APPS` by default.                                                                                                                                              |
| `member`      | `HeaderMember`        | The signed-in member: `{ name: string; cid: number \| string; rating?; pilotRating? }`, as `UserMenu` takes them.                                                                                      |
| `signInHref`  | `string`              | Required. Where Sign in goes.                                                                                                                                                                          |
| `signOutHref` | `string`              | Required. Where the user menu's Sign out goes.                                                                                                                                                         |
| `hub`         | `string`              | The hub's address, where the logo goes and where the user menu's My profile and Settings are. `https://flyindycenter.com` by default. With no `app`, the Apps menu marks the app whose `href` this is. |
| `skipTo`      | `string`              | The main content, as `#id`, for the skip link. `#main` by default.                                                                                                                                     |
| `class`       | `string`              | Added to the `<header>`. Layout only.                                                                                                                                                                  |
| others        | `<header>` attributes | Passed to the `<header>`: `id` and the rest.                                                                                                                                                           |

The type `HeaderMember` is exported beside it.

## What it shows

Left to right:

- **Skip to content**, hidden until it has keyboard focus (`SkipLink`).
- The Indy Center mark on phones, the full logo from `sm` (640px), to
  the hub. In an app, a short divider and then the app's name, to the
  app's home. On the hub, the logo alone.
- From `lg` (1024px), the app's navigation (`AppNav`). The logo and name
  take a fixed 16rem, so the navigation starts in the same place in every
  app; a name too long for it is cut short with an ellipsis, the full
  name in its tooltip.
- At the right: Apps (`AppsMenu`), the current app marked; then the
  member's initials (`UserMenu`), or **Sign in with VATSIM** when nobody
  is signed in ("Sign in" below `xl`, 1280px, where the navigation needs
  the room).
- Below `lg`, a Menu button opens the phone menu under the bar: the app's
  navigation as rows, groups opening in place (`AppNavMenu`). The user
  menu stays in the bar at every width.

## Page titles

Each page sets its own `<title>`, page first:

- In an app: `<Page> | <App> | Indy Center`, such as
  `Sessions | Training | Indy Center`. The app's home is
  `<App> | Indy Center`, such as `Training | Indy Center`.
- On the hub: `<Page> | Indy Center`, such as `Events | Indy Center`.
  The hub's home is `Indy Center`.

```svelte
<svelte:head><title>Sessions | Training | Indy Center</title></svelte:head>
```

## Looks

- Dark in both schemes: the header puts itself in the dark scope
  (`data-theme="dark"`), so it is the dark `background` with a `border`
  line below, on a light page as on a dark one.
- 64px tall at every width, plus its line. It sticks to the top of the
  window as the page scrolls. It has no blur behind it: the Apps and user
  menus' panels on phones are pinned 64px from the top.
- The logo, divider and app name: `foreground`, the divider `border`. The
  name is semibold and never underlined.
- Sign in is a small primary `Button`.
- The phone menu opens under the bar, with a `border` line above it, and
  scrolls when taller than the screen.
- A `ring` outline on whatever is reached by keyboard. Every control is at
  least 44px tall.

## Accessibility

- It renders `<header>`, the page's `banner` landmark when it isn't
  inside `<main>`, `<article>`, `<aside>`, `<nav>` or `<section>`.
- The skip link is the first Tab stop; following it moves focus to the
  main content.
- The logo link is named "Indy Center home"; the app's name link by the
  name.
- The navigation is a `<nav>` named "Main", in the bar from `lg` and in
  the phone menu below it, never both.
- The Menu button is a disclosure: a `<button aria-expanded>` named
  "Menu" and the phone menu it shows. Escape closes it and puts focus
  back on the button; a tap outside it, Tabbing out of it, or following
  one of its links closes it too.
- Sign in is a link named "Sign in with VATSIM" at every width.
- Its Apps and user menus are described on their own pages.
