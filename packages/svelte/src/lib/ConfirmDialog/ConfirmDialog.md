---
title: ConfirmDialog
description: A Modal that asks the member to confirm an action, placed in a page or raised with confirmAction() in place of confirm().
---

## Checklist

- [ ] Use it before an action that is hard to undo: deleting, withdrawing,
      sending for good. Don't ask for actions that are easy to undo; just
      do them, and say so with [`toast()`](../Toast/Toast.md).
- [ ] In place of `confirm()`, call `await confirmAction({ … })`: it
      resolves true or false. Place a `<ConfirmDialog>` yourself only
      when the message needs markup.
- [ ] Write the `title` as the question, short: "Delete event?". Write the
      message as what will happen: "FNO Chicago will be removed for
      everyone."
- [ ] Name the confirm button for the action ("Delete event", "Withdraw
      request"), not "OK" or "Yes".
- [ ] Set `danger` when the action deletes or can't be undone.
- [ ] Don't colour it or add buttons. For a task with fields, use
      [`Modal`](../Modal/Modal.md).

## Use

With the function, in an event handler or a `use:enhance` callback:

```svelte
<script>
  import { enhance } from "$app/forms";
  import { Button, confirmAction } from "@indy-center/svelte";
</script>

<form
  method="POST"
  action="?/delete"
  use:enhance={async ({ cancel }) => {
    const sure = await confirmAction({
      title: "Delete event?",
      message: "FNO Chicago will be removed for everyone.",
      confirmLabel: "Delete event",
      danger: true,
    });
    if (!sure) cancel();
  }}
>
  <Button type="submit" variant="danger">Delete</Button>
</form>
```

A handler that has to say no straight away, such as `onsubmit` on a
form without `use:enhance`, can't wait for the answer: stop the
submit, ask, and send it again if confirmed.

```svelte
<script>
  import { confirmAction } from "@indy-center/svelte";

  let confirmed = false;

  async function onsubmit(event) {
    if (confirmed) return; // The second time: let it go.
    event.preventDefault();
    const form = event.currentTarget;
    const { submitter } = event;
    confirmed = await confirmAction({
      title: "Withdraw request?",
      message: "Your request for ZID_CTR on Friday will be withdrawn.",
      confirmLabel: "Withdraw request",
    });
    if (confirmed) form.requestSubmit(submitter);
    confirmed = false;
  }
</script>

<form method="POST" action="?/withdraw" {onsubmit}>…</form>
```

Placed in the page, for a message with markup:

```svelte
<script>
  import { Button, ConfirmDialog } from "@indy-center/svelte";
  let open = $state(false);
</script>

<Button variant="danger" onclick={() => (open = true)}>Withdraw</Button>

<ConfirmDialog
  bind:open
  title="Withdraw request?"
  confirmLabel="Withdraw request"
  danger
  onconfirm={withdraw}
>
  <p>Your request for <strong>ZID_CTR</strong> on Friday will be withdrawn.</p>
</ConfirmDialog>
```

## Props

| Prop           | Type         | Notes                                                                |
| -------------- | ------------ | -------------------------------------------------------------------- |
| `open`         | `boolean`    | Whether it shows. Bindable; false by default.                        |
| `title`        | `string`     | Required. The question, which names it.                              |
| `confirmLabel` | `string`     | The confirm button's text. "Confirm" by default.                     |
| `cancelLabel`  | `string`     | The cancel button's text. "Cancel" by default.                       |
| `danger`       | `boolean`    | A danger confirm button, and focus starts on Cancel. Off by default. |
| `onconfirm`    | `() => void` | Runs after it closes from the confirm button.                        |
| `oncancel`     | `() => void` | Runs after it closes any other way.                                  |
| `children`     | snippet      | The message.                                                         |
| `class`        | `string`     | Added to the `<dialog>`, as for Modal. Layout only.                  |
| others         | Modal's      | Passed to the Modal, then the `<dialog>`.                            |

`confirmAction(options)` takes `title`, `message` (text; its line
breaks are kept, so `\n\n` starts a paragraph), and the same
`confirmLabel`, `cancelLabel` and `danger`, and returns
`Promise<boolean>`: true if confirmed, false otherwise. It adds a dialog
to the page for the question and removes it after. The browser's Back
button cancels it. On the server it resolves false at once.

Placed yourself, bind `open` (`bind:open`): it turns false when the
member answers. A plain `open={true}` won't open it again after that.

## Looks

A `Modal` at size `sm` (28rem): the message in `foreground-soft`, then
Cancel (`secondary`) and the confirm button (`primary`, or `danger`) at
the foot, the confirm button last.

## Accessibility

- A `<dialog>` with `role="alertdialog"`, named by the title and
  described by the message, so readers announce both when it opens.
- Focus starts on the confirm button, or on Cancel when `danger` is set,
  so a stray Enter doesn't delete anything. It returns to whatever had it
  when the dialog opened.
- Escape, the close button and a click outside all cancel, as does
  the browser's Back button for `confirmAction()`.
