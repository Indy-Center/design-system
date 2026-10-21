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
      happening ("Saving"). Pass `busy` from the start (`busy={saving}`,
      false at first), not only once the work begins, so screen readers
      hear it start.
- [ ] For an on/off toggle of an action ("Notify me"), pass `pressed` and
      flip it in `onclick`, where you can also save it or undo it if the
      save fails. Keep the text the same in both states: the mark and
      `aria-pressed` show which it is. To filter a list, use `FilterChip`,
      which flips itself.
- [ ] Don't colour or size it with classes: use `variant` and `size`.
      `class` is for layout only, such as a margin or `w-full`.

## Use

```svelte
<script>
  import { Button } from "@indy-center/svelte";

  let saving = $state(false);
  let notify = $state(false);

  function deleteEvent() {
    // Ask first, then delete.
  }
</script>

<Button type="submit" busy={saving} busyLabel="Saving">Save changes</Button>
<Button variant="secondary" href="/events/new">New event</Button>
<Button variant="danger" onclick={deleteEvent}>Delete event</Button>

<Button variant="secondary" pressed={notify} onclick={() => (notify = !notify)}>
  Notify me
</Button>
```

## Props

| Prop        | Type                                       | Notes                                                                                                             |
| ----------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| `variant`   | `"primary"` \| `"secondary"` \| `"danger"` | `primary` by default.                                                                                             |
| `size`      | `"sm"` \| `"md"` \| `"lg"`                 | `md` by default, the same text size as `Input`.                                                                   |
| `href`      | `string`                                   | Makes it an `<a>`. Without it, a `<button type="button">`.                                                        |
| `busy`      | `boolean`                                  | Shows a `Spinner`, sets `aria-busy` and ignores presses.                                                          |
| `busyLabel` | `string`                                   | What screen readers are told while busy. "Working" by default.                                                    |
| `pressed`   | `boolean`                                  | Makes it a toggle, with `aria-pressed`. Buttons only, not with `href`.                                            |
| `children`  | `Snippet`                                  | The button's text.                                                                                                |
| `class`     | `string`                                   | Added after Button's own classes. Layout only.                                                                    |
| others      | `<button>` or `<a>` attributes             | Passed to the element: `type`, `onclick`, `aria-*` and the rest. `disabled` is for buttons only, not with `href`. |

## Looks

- `primary`: `primary` (`#0369A1`) under `primary-foreground` (white), in
  both schemes; `primary-hover` (`#075985`) on hover.
- `secondary`: no fill, an `input` (`#64748B`) edge and `foreground` text;
  `muted` fill on hover.
- `danger`: `destructive` under `card` text: `#B91C1C` under white in
  light, `#F87171` under `#1E293B` in dark (white on that light red would
  fail contrast). On hover it is a 90% fill, letting a little of the page
  through: slightly lighter on a light page, slightly darker on a dark one.
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
  through, nor does a middle-click on a link. (The browser's own "Open in
  new tab" menu item still works.) Its name stays the same ("Save
  changes").
- The busy label is said through a screen-reader-only `role="status"`
  just before the button, not inside it: readers hold back updates inside
  an `aria-busy` element, and a button's contents are presentational. It
  is there whenever `busy` is passed (hence the checklist's "from the
  start"), empty until busy starts, so the change is announced politely.
  The spinner inside is hidden from readers.
- `pressed` sets `aria-pressed`, so readers say "toggle button, pressed"
  or "not pressed".
- Every size meets the 44px target (WCAG 2.5.8).
