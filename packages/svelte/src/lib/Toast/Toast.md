---
title: Toast
description: A brief message after an action, raised with toast() and announced by screen readers, even after a redirect.
---

## Checklist

- [ ] Put one `<Toaster />` in the app's root layout, and no other.
- [ ] Call `toast(level, message)` after an action finishes: "Roster
      saved.", "Session request sent.". It shows on the next page too,
      so call it before a redirect.
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
  import { Toaster } from "@indy-center/svelte";
  let { children } = $props();
</script>

<Header … />
{@render children()}
<Toaster />
```

```ts
import { toast } from "@indy-center/svelte";

toast("success", "Roster saved.");
toast("danger", "We couldn't save the roster. Try again.");
```

`toast()` does nothing on the server; call it from the browser, such as
in a `use:enhance` callback or an event handler.

## Props and arguments

`toast(level, message)`:

| Argument  | Type                                           | Notes                      |
| --------- | ---------------------------------------------- | -------------------------- |
| `level`   | `"info" \| "success" \| "caution" \| "danger"` | How serious it is.         |
| `message` | `string`                                       | The text, a full sentence. |

`<Toaster />` takes no props.

## Looks

- Top right, just below the header, so it never covers the header or its
  menus; full width under the header on a phone. The header sets
  `--centerline-header-height`; without one, Toaster assumes 4rem.
- A card (`card`, `border`) with a 4px rule down its left edge and an MDI
  outline icon in the level's role, and the level's word in bold before
  the message.
- Newest first. At most 3 show; the rest wait. A more important toast
  takes the place of a less important one (the oldest among equals),
  which goes back to the front of the queue. The most important waiting
  toast shows next.

## Accessibility

- Two live regions, on the page from the start: polite (`role="status"`)
  for `info`, `success` and `caution`, assertive (`role="alert"`) for
  `danger`. Each toast is read once there, with its level ("Success:
  Roster saved."); the toasts themselves aren't live.
- Each toast stays 5 seconds. Its clock stops while the pointer or focus
  is on the toasts, so there's time to read it.
- Each has a 44px close button named after its message. Escape closes the
  newest, unless a menu used that Escape or a modal is open. Closing the
  focused toast moves focus to the next one.
- Toasts still showing or waiting when the page goes (a full-page
  redirect) are kept for this tab and shown, and read, on the next page.
  After a reload within 5 seconds they show again.
