---
title: UserMenu
description: The header's round initials button and the menu it opens, with who is signed in, their profile and settings on the hub, the time zone and colour scheme, and Sign out.
---

## Checklist

- [ ] It belongs in the header, at its right, after the Apps button. The
      `Header` places it for a signed-in member; an app doesn't place it
      by itself.
- [ ] Pass the member's `name` as the app shows it (for a name-private
      member, the first name alone), their `cid`, and their controller
      and pilot ratings as the data source spells them. Don't shorten or
      look them up first.
- [ ] Give `signOutHref`: identity's sign-out address, with the page to
      come back to.
- [ ] Don't add the app's own items (its admin, its settings). They go
      in its navigation (`AppNav`), so every app's menu holds the same
      things.
- [ ] Call `setColorScheme` and `setTimeZone` in the root layout, as
      `ColorSchemeSetting` and `TimeZoneSetting` say: the menu's choices
      take their fallback, cookie domain and profile save from there.
- [ ] Don't colour it or change its sizes. It is dark in both schemes by
      itself. `class` is for layout only, such as a margin.

## Use

```svelte
<script>
  import { UserMenu } from "@indy-center/svelte";

  let { data } = $props();
</script>

<UserMenu
  name={data.member.name}
  cid={data.member.cid}
  rating={data.member.rating}
  pilotRating={data.member.pilotRating}
  signOutHref={logoutUrl(identityUrl, page.url.href)}
/>
```

## Props

| Prop          | Type               | Notes                                                                                                                    |
| ------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `name`        | `string`           | Required. The member's name as the app shows it. Its initials are on the button.                                         |
| `cid`         | `number \| string` | Required. Their VATSIM CID.                                                                                              |
| `rating`      | `number \| string` | Their controller rating, any spelling `Rating` takes (`5`, `"C1"`). None shows if left out.                              |
| `pilotRating` | `number \| string` | Their pilot rating, any spelling `Rating` takes with `kind="pilot"`. None shows for `0` or left out.                     |
| `signOutHref` | `string`           | Required. Where Sign out goes.                                                                                           |
| `hub`         | `string`           | The hub's address, where My profile (`/profile`) and Settings (`/settings`) are. `https://flyindycenter.com` by default. |
| `class`       | `string`           | Added to its root `<div>`. Layout only.                                                                                  |
| others        | `<div>` attributes | Passed to its root `<div>`: `id` and the rest.                                                                           |

## What it shows

The button is a round badge with the initials of the name's first and
last words ("Sam Rivera" is SR; a first name alone, one letter). A name
with no letters shows an account icon instead.

The menu, top to bottom:

- The initials again, the name, "CID 1234567", and the ratings as
  `Rating` chips: the controller rating, then the pilot rating. VATSIM's
  pilot rating `0` (no rating yet) isn't shown, as the hub does today.
- **My profile** and **Settings**, links to the hub's pages.
- The time zone, `TimeZoneSetting`.
- The colour scheme, `ColorSchemeSetting`. A choice is saved and applied
  at once, and the menu stays open.
- **Sign out**, a link to `signOutHref`.

Below `sm` (640px) the menu spans the screen under a 64px header. It
scrolls when taller than the screen.

## Looks

- Dark in both schemes: it puts itself in the dark scope
  (`data-theme="dark"`), as the header around it.
- The initials in `primary-foreground` on a `primary` circle, in the
  heading font. The button takes the soft fill (`foreground` at 10%) on
  hover, and a `foreground-soft` ring round the circle while open.
- The menu opens on a `card` panel with a `border` line, lined up with
  the button's right edge, its sections split by `border` lines.
- The name in `foreground`, semibold; the CID in `muted-foreground`, the
  number in mono.
- My profile and Settings in the `link` colour, underlined on hover.
  Sign out in `destructive`, underlined on hover.
- A `ring` outline on whatever is reached by keyboard. The button and
  every row are at least 44px tall.

## Accessibility

- A disclosure, not a menu: a `<button aria-expanded>` named "Account:"
  and the member's name (the initials are only its look), and the panel
  it shows. Tab moves into the panel and through it.
- Escape closes it and puts focus back on the button. A tap outside it,
  Tabbing out of it, or following one of its links closes it too.
- Each rating is read with what it is: "ATC rating S3 Senior Student",
  "Pilot rating PPL Private Pilot License". The chips are tab stops, so a
  keyboard can show their long names.
- The time zone and colour scheme are `<fieldset>`s of
  `<button aria-pressed>` rows; see their own pages.
