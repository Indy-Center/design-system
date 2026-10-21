---
title: Modal
description: A dialog over the page, on the native dialog element, named by its heading, that keeps focus until it closes.
---

## Checklist

- [ ] Use it for a short task that has to be finished or left before
      going on: a position request, a form of a few fields. For a page of
      content, link to a page instead; to show more in place, use
      [`Disclosure`](../Disclosure/Disclosure.md).
- [ ] To ask "are you sure?", use
      [`ConfirmDialog`](../ConfirmDialog/ConfirmDialog.md) or
      `confirmAction()`, not a Modal of your own.
- [ ] Give it a `title` that says what it's for: "Request position", not
      "Details".
- [ ] Bind `open` (`bind:open`), so it turns false when the member closes
      it with Escape, the close button or a click outside.
- [ ] Put its buttons in `actions`, the main one last, and close it
      yourself (`open = false`) when the task is done.
- [ ] Don't colour it. Pick a `size` instead of setting its width; `class`
      is for anything else about its place.

## Use

```svelte
<script>
  import { Button, Modal } from "@indy-center/svelte";
  let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Request position</Button>

<Modal bind:open title="Request position">
  <form id="request" method="POST" action="?/request">…</form>
  {#snippet actions()}
    <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
    <Button type="submit" form="request">Send request</Button>
  {/snippet}
</Modal>
```

## Props

| Prop       | Type                   | Notes                                                                               |
| ---------- | ---------------------- | ----------------------------------------------------------------------------------- |
| `open`     | `boolean`              | Whether it shows. Bindable; false by default.                                       |
| `title`    | `string`               | Required. The `h2` at its top, which names it.                                      |
| `size`     | `"sm" \| "md" \| "lg"` | Its widest: 28rem, 32rem (default), 42rem. Always 1rem clear of the window's sides. |
| `onclose`  | `() => void`           | Runs each time it closes, however it closed.                                        |
| `children` | snippet                | What it holds, below the heading.                                                   |
| `actions`  | snippet                | Its buttons, in a row at the foot, right-aligned, wrapping on a phone.              |
| `class`    | `string`               | Added after Modal's own classes, on the `<dialog>`. Layout only.                    |
| others     | `<dialog>` attributes  | Passed to the `<dialog>`, such as `role="alertdialog"`.                             |

## Looks

- A card (`card`, `border`, rounded, a large shadow) in the middle of the
  window, 1rem clear of its edges on a phone. Its content scrolls when
  it's taller than the window.
- The title in `foreground` at Heading's look 2; the content in
  `foreground-soft`.
- The page behind is dimmed with black at 60%, in either scheme.

## Accessibility

- A native `<dialog>` opened with `showModal()`: the browser makes it a
  modal dialog and the page behind it inert, so focus stays inside.
- Named by its heading (`aria-labelledby`), so readers announce the
  title when it opens.
- Opening moves focus to the first control in it, the close button,
  unless a control has `autofocus`. Closing returns focus to whatever had
  it when it opened, as does taking it off the page while open (though
  `onclose` doesn't run then).
- Escape closes it, as does a click on the dimmed page around it. A
  press that starts or ends inside, such as selecting text, doesn't.
- The close button is 44px square and named "Close".
