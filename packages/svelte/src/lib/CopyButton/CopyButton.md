---
title: CopyButton
description: An icon button that copies a frequency, CID or callsign to the clipboard, and says "Copied".
---

## Checklist

- [ ] Use `CopyButton` beside a value a member pastes somewhere else: a
      frequency, CID or callsign into their client. Don't use it for text
      they only read.
- [ ] Give `text` exactly what should be pasted (`134.000`, not
      `134.000 MHz`), and `label` what it is, in lower case unless it is
      an initialism: `label="frequency"` names the button "Copy
      frequency". When a row has several, say whose:
      `label="ZID_CTR's frequency"`.
- [ ] Keep the value itself on the page beside it: the button copies, it
      doesn't show what.
- [ ] Don't change its icon, colours or size. `class` is for layout only,
      such as a margin.

## Use

```svelte
<script>
  import { CopyButton } from "@indy-center/svelte";
</script>

<span class="font-mono">134.000</span>
<CopyButton text="134.000" label="frequency" />
```

## Props

| Prop    | Type                  | Notes                                                                                                           |
| ------- | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `text`  | `string`              | Put on the clipboard when pressed.                                                                              |
| `label` | `string`              | What it copies. The button is named "Copy" and this: "Copy frequency".                                          |
| `class` | `string`              | On the box around the button and its message, not on the button. Layout only.                                   |
| others  | `<button>` attributes | Passed to the button: `id`, `disabled`, `aria-describedby` and the rest. Not `aria-label` or `aria-labelledby`. |

## Looks

- A small `secondary` `Button` (44px square) holding MDI's content-copy
  icon at 18px. For a moment after a press the icon is a check, or an alert
  circle if copying failed.
- Its message, "Copied" or "Couldn't copy", appears just after the button
  in 14px `muted-foreground` (`#475569` light, `#9CA3AF` dark): for 2
  seconds after a copy, 5 after a failure. The words carry the outcome,
  not the colour. The message takes room in the line while it shows, so
  leave space after the button in a tight row.

## Accessibility

- It renders a native `<button>` named "Copy" and `label`; Enter and Space
  press it. The name stays the same after a press.
- It uses the Clipboard API, which browsers allow only on `https` (and
  `localhost`) and after a press. Where it is refused, the message says
  "Couldn't copy", so the member knows to select the value instead.
- The message is in a `role="status"` region beside the button, on the
  page from the start and empty until a press, so readers announce it
  politely. A second press empties it for a tenth of a second
  first, so "Copied" is read again.
- The icons are hidden from readers.
