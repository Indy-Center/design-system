---
title: Button
description: A button for an action on the page, or a link that looks like one, in three variants and three sizes, with busy and toggle states.
---

## Checklist

- [ ] Use `Button` to do something on this page: save, open, delete. Give
      it `href` only when it goes to another page and must look like a
      button ("New event"); for a link in text, use `Link`.
- [ ] One `primary` per area: the main action. Use `secondary` for the
      rest, and `danger` for an action that deletes or can't be undone.
- [ ] Write a verb for what it does: "Save changes", "Delete event", not
      "OK" or "Submit". A button with only a symbol needs `aria-label`.
- [ ] Inside a form, give the submit button `type="submit"`. Every other
      button is `type="button"` by itself.
- [ ] While its work runs, set `busy` instead of changing its text or
      disabling it; set `busyLabel` when "Working" isn't what is
      happening ("Saving").
- [ ] For an on/off toggle, pass `pressed` and flip it in `onclick`. Keep
      the text the same in both states: the mark and `aria-pressed` show
      which it is.
- [ ] Don't colour or size it with classes: use `variant` and `size`.
      `class` is for layout only, such as a margin or `w-full`.

## Use

```svelte
<script>
  import { Button } from "@indy-center/svelte";

  let saving = $state(false);
  let showOffline = $state(false);
</script>

<Button type="submit" busy={saving} busyLabel="Saving">Save changes</Button>
<Button variant="secondary" href="/events">Cancel</Button>
<Button variant="danger" onclick={confirmDelete}>Delete event</Button>

<Button
  variant="secondary"
  pressed={showOffline}
  onclick={() => (showOffline = !showOffline)}
>
  Show offline
</Button>
```

## Props

| Prop        | Type                                       | Notes                                                                        |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------------------- |
| `variant`   | `"primary"` \| `"secondary"` \| `"danger"` | `primary` by default.                                                        |
| `size`      | `"sm"` \| `"md"` \| `"lg"`                 | `md` by default, the same text size as `Input`.                              |
| `href`      | `string`                                   | Makes it an `<a>`. Without it, a `<button type="button">`.                   |
| `busy`      | `boolean`                                  | Shows a `Spinner`, sets `aria-busy` and ignores presses.                     |
| `busyLabel` | `string`                                   | What the spinner says to screen readers. "Working" by default.               |
| `pressed`   | `boolean`                                  | Makes it a toggle, with `aria-pressed`. Buttons only, not with `href`.       |
| `children`  | `Snippet`                                  | The button's text.                                                           |
| `class`     | `string`                                   | Added after Button's own classes. Layout only.                               |
| others      | `<button>` or `<a>` attributes             | Passed to the element: `type`, `disabled`, `onclick`, `aria-*` and the rest. |

## Looks

- `primary`: `primary` (`#0369A1`) under `primary-foreground` (white), in
  both schemes; `primary-hover` (`#075985`) on hover.
- `secondary`: no fill, a `input` (`#64748B`) edge and `foreground` text;
  `muted` fill on hover.
- `danger`: `destructive` under `card` text: `#B91C1C` under white in
  light, `#F87171` under `#1E293B` in dark (white on the dark red would
  fail contrast). Slightly lighter on hover.
- Sizes: `sm` is 14px text and `md` 16px, both 44px tall; `lg` is 18px
  text, 48px tall. Every size is at least 44px wide.
- A `ring` outline when reached by keyboard. Faded when `disabled`.
- Busy: the spinner sits before the text, in the text's colour.
- Pressed: a small round mark before the text, filled when on and hollow
  when off, so the state doesn't rest on colour.

## Accessibility

- It renders a native `<button>` (or `<a href>`), so Enter (and Space, on
  a button) presses it.
- `busy` keeps it focusable and enabled, so focus isn't lost while the
  work runs; presses are dropped, and a submit or link doesn't go
  through. Its name reads with the busy label after the text ("Save
  changes Saving"), and the label is announced politely when it appears.
- `pressed` sets `aria-pressed`, so readers say "toggle button, pressed"
  or "not pressed".
- Every size meets the 44px target (WCAG 2.5.8).
