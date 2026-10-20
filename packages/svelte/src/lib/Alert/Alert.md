---
title: Alert
description: A tinted box that tells the member something about the page, at one of four severities, announced by screen readers.
---

## Checklist

- [ ] Use it for something that stays on the page until it's fixed or
      read: a form that didn't save, a notice about the schedule. To
      confirm an action that just happened ("Roster saved."), use
      [`toast()`](../Toast/Toast.md) instead.
- [ ] Pick the `level` by what it means, not its colour: `info` good to
      know, `success` it worked, `caution` could cause a problem, `danger`
      will cause a problem or failed.
- [ ] Write the message as a sentence. Don't start it with the level's
      word ("Caution: …"): Alert says that to screen readers itself.
- [ ] Add a `title` only when the message needs a short heading.
- [ ] Make it `dismissible` only when it's fine for the member to hide it
      for good on this page.
- [ ] Don't change its colours or icon. `class` is for layout only, such
      as a margin.

## Use

```svelte
<script>
  import { Alert } from "@indy-center/svelte";
</script>

<Alert level="danger" title="Not saved">
  We couldn't save the roster. Try again.
</Alert>

<Alert level="info" dismissible>The roster updates nightly.</Alert>
```

## Props

| Prop          | Type                                           | Notes                                                   |
| ------------- | ---------------------------------------------- | ------------------------------------------------------- |
| `level`       | `"info" \| "success" \| "caution" \| "danger"` | Required. Sets the role, icon, colour and spoken label. |
| `title`       | `string`                                       | Optional bold first line.                               |
| `dismissible` | `boolean`                                      | Shows a close button. Off by default.                   |
| `ondismiss`   | `() => void`                                   | Called after the close button hides it.                 |
| `children`    | snippet                                        | The message.                                            |
| `class`       | `string`                                       | Added after Alert's own classes. Layout only.           |
| others        | `<div>` attributes                             | Passed to the outer `<div>`.                            |

## Looks

- A wash (10%) and a faint border (40%) of the level's role, so the page
  shows through: `info`, `success`, `warning` (for `caution`) and
  `destructive` (for `danger`).
- An MDI outline icon in the role's colour, a different shape for each
  level: a circled i, a circled tick, a triangle, an octagon. Colour is
  never the only signal.
- The title in `foreground`, the message in `foreground-soft` (body
  text), in either scheme.

## Accessibility

- `danger` is `role="alert"`, read at once; the others are
  `role="status"`, read when the reader is free.
- Readers hear the level's word first ("Caution: …"), from text only
  they see. The icon is hidden from them.
- The close button is 44px square and named after the title, or the
  message when there's no title ("Dismiss Not saved"). Once it's
  closed, focus is on the page; move it somewhere useful in `ondismiss`
  if the member was in the middle of something.
