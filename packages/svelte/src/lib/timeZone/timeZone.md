---
title: Time zone
description: The time-zone cookie and profile setting, read on the server so every Time draws the member's zone from the start.
---

## Checklist

- [ ] Read the choice once, in the root `+layout.server.ts`, with
      `readTimeZone(cookies, { profile })` from
      `@indy-center/svelte/server`. Pass the signed-in member's profile
      setting as `profile`, or leave it out.
- [ ] Hand it on once, in the root `+layout.svelte`, with
      `setTimeZone(() => data.timeZone, { saveToProfile })`. Pass a
      function, so `Time` follows when the layout's data reloads.
- [ ] For a signed-in member, give `saveToProfile`: it is called with
      `"zulu"`, `"device"` or a zone name on every choice. Leave it out
      when nobody is signed in.
- [ ] Let the member choose with `TimeZoneSetting` (in the user menu and
      on Settings) and `TimeZoneLine` (above a list of times). Never write
      the cookie yourself, and never save a zone the member didn't pick.
- [ ] Keep pages that read it out of shared caches (`Cache-Control:
private`), or one member's times could be served to another.

## Use

`src/routes/+layout.server.ts`:

```ts
import { readTimeZone } from "@indy-center/svelte/server";

export const load = ({ cookies, locals }) => ({
  timeZone: readTimeZone(cookies, { profile: locals.member?.timeZone }),
});
```

`src/routes/+layout.svelte`:

```svelte
<script lang="ts">
  import { setTimeZone } from "@indy-center/svelte";

  let { data, children } = $props();
  setTimeZone(() => data.timeZone, {
    saveToProfile: data.member ? saveTimeZoneToProfile : undefined,
  });
</script>

{@render children()}
```

`saveTimeZoneToProfile` is the app's own call to identity (identity's
ticket `time-zone/01`), such as a `fetch` to a form action.

## What it does

- **The cookie** is `indy-time-zone`, shared across `flyindycenter.com`
  with the colour scheme's attributes: `Path=/`, a year, `SameSite=Lax`,
  `Domain=flyindycenter.com` on that domain (host-only elsewhere),
  `Secure` on https, readable by the page. It is written only when the
  member chooses, and holds:
  - `zulu`: every time in Zulu.
  - `device:America/Chicago`: "Use my device's time zone", last seen in
    Chicago. The server draws Chicago; the browser draws the device's
    zone, and rewrites the cookie when the device has moved (after
    travel), so the next page is right from the server.
  - `America/Chicago`: "Another time zone", drawn in that zone
    everywhere.
- **Nothing saved** is local by default: the server draws Zulu, and the
  browser switches to the device's zone after load. "Use my device's time
  zone" shows ticked. Nothing is written until the member chooses.
- **Validation**: the server accepts only names in
  `Intl.supportedValuesOf('timeZone')` (under any of a zone's names, as
  runtimes list different ones), or `UTC`, of 64 characters at most.
  Anything else counts as nothing saved.
- **The profile**: a signed-in member's setting (an IANA name, `device`
  or `zulu`) fills in only where this browser has no cookie (a new
  browser); a cookie wins over it. So a choice made here holds even if
  the page reloads before the profile save finishes. `device` from the
  profile has no zone yet: the server draws Zulu and the browser writes
  the device's zone. (The colour scheme's rule is the opposite for now,
  to be revisited when identity stores it.)
- **A choice applies at once**: every `Time`, `TimeZoneSetting` and
  `TimeZoneLine` on the page redraws, and every `DateTimeInput`'s box
  moves to the new zone. `Time` and `DateTimeInput` read the zone
  through one helper (`memberZone`), so a member types in the zone the
  page shows.
- **Without `setTimeZone`**, nothing is saved as far as the server knows:
  times follow the device, and the controls still write the cookie.

## The note

Each control has a "What's saved?" button. The time zone's note:
"Saved on this browser for a year, across flyindycenter.com, and to your
Indy Center profile for every browser you sign in on." Without
`saveToProfile`, it says only "Saved on this browser for a year, across
flyindycenter.com."

## Options

| Option                          | Type                           | Notes                                                                                           |
| ------------------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------- |
| `profile` (`readTimeZone`)      | `string \| null`               | The member's profile setting: an IANA name, `"device"` or `"zulu"`. Used when no cookie is set. |
| `saveToProfile` (`setTimeZone`) | `(setting: string) => unknown` | Called with the profile setting on every choice. Its failure is logged, not shown.              |
| `domain` (`setTimeZone`)        | `string`                       | The domain the cookie is shared across; `flyindycenter.com` by default.                         |

`readTimeZone` returns a `TimeZoneChoice`, or `undefined` when nothing is
saved: `{ kind: "zulu" }`, `{ kind: "device", zone? }` or
`{ kind: "zone", zone }`.

## Accessibility

Nothing of its own: see `TimeZoneSetting`, `TimeZoneLine` and `Time`.
