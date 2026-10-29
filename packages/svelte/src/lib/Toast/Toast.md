---
title: Toast
description: A brief message after an action, raised with toast() or toastFromServer() and announced by screen readers, even after a redirect.
---

## Checklist

- [ ] Put one `<Toaster />` in the app's root layout, and no other.
- [ ] In the browser, call `toast(level, message)` after an action
      finishes: "Roster saved.", "Session request sent.". It shows on
      the next page too, so call it before a redirect.
- [ ] On the server, in a form action or `load`, call
      `toastFromServer(cookies, level, message)` instead, before
      `redirect()` or returning.
- [ ] For something the member must read or act on, use
      [`Alert`](../Alert/Alert.md) on the page instead: a toast leaves
      after 5 seconds.
- [ ] Write a short sentence. Don't start it with the level's word:
      the toast shows and says it.
- [ ] Use `danger` for a failure, which interrupts screen readers; the
      rest wait their turn.

## Use

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { Toaster } from "@indy-center/centerline-svelte";
  let { children } = $props();
</script>

<Header … />
{@render children()}
<Toaster />
```

In the browser, such as in an event handler or a `use:enhance` callback:

```ts
import { toast } from "@indy-center/centerline-svelte";

toast("success", "Roster saved.");
toast("danger", "We couldn't save the roster. Try again.");
```

On the server, such as in a form action that redirects:

```ts
// src/routes/roster/+page.server.ts
import { redirect } from "@sveltejs/kit";
import { toastFromServer } from "@indy-center/centerline-svelte";

export const actions = {
  default: async ({ cookies }) => {
    // …save the roster…
    toastFromServer(cookies, "success", "Roster saved.");
    redirect(303, "/roster");
  },
};
```

`toast()` does nothing on the server. `toastFromServer()` puts the toast
in a short-lived cookie; `<Toaster>` shows it on the page the browser
lands on, whether that's a full page load or a `use:enhance` update.

The cookie is `centerline-toasts`: first-party, for this app only,
holding just the messages and no identifier. The browser reads it, so it
isn't `httpOnly`. `<Toaster>` deletes it as soon as it shows the toasts,
and it expires after a minute regardless. List it on the app's privacy
page with its purpose.

## Props

`<Toaster />` takes no props, and the app doesn't style it: there is one,
for the whole page.

`toast(level, message)` and `toastFromServer(cookies, level, message)`:

| Argument  | Type                                           | Notes                                                  |
| --------- | ---------------------------------------------- | ------------------------------------------------------ |
| `cookies` | SvelteKit's `cookies`                          | `toastFromServer` only: the request event's `cookies`. |
| `level`   | `"info" \| "success" \| "caution" \| "danger"` | How serious it is.                                     |
| `message` | `string`                                       | The text, a full sentence.                             |

## Looks

- Top right, just below the header, so it never covers the header or its
  menus; full width under the header on a phone. The header sets
  `--centerline-header-height`; without one, Toaster assumes 4rem.
- A card (`card`, `border`) with a 4px rule down its left edge and an MDI
  outline icon in the level's role, and the level's word in bold before
  the message.
- Newest first. At most 3 show; the rest wait. A more important toast
  takes the place of a less important one (the oldest among equals),
  which goes back to the front of the queue. Waiting toasts show in turn.

## Accessibility

- Two live regions, on the page from the start: polite (`role="status"`)
  for `info`, `success` and `caution`, assertive (`role="alert"`) for
  `danger`. Each toast is read once there, with its level ("Success:
  Roster saved."), when it first shows; one that is waiting is read when
  its turn comes. The toasts themselves aren't live.
- Each toast stays 5 seconds. Its clock stops while the pointer or focus
  is on the toasts, so there's time to read it.
- Each has a 44px close button named after its message. Escape closes the
  top one, the newest shown, unless a menu used that Escape or a modal is
  open. Closing the focused toast moves focus to the next one.
- Toasts still showing or waiting when the page goes (a full-page
  redirect) are kept for this tab and shown, and read, on the next page.
  After a reload within 5 seconds they show again.
