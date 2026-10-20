---
title: Checkbox
description: A native checkbox with its label beside it, ticked in the primary role.
---

## Checklist

- [ ] Use it for a yes-or-no choice that takes effect when the form is
      sent, or for picking any number of options from a list. For one of
      several options, use `Radio`s.
- [ ] Put a list of checkboxes in a `Fieldset`, whose legend says what
      they choose. A single checkbox can stand alone.
- [ ] Write the label as what's true when it's ticked ("Show on the
      roster"), not a question.
- [ ] Don't colour it: no `accent-*`, `text-*` or size classes. `class`
      goes on the row and is for layout only, such as a margin.

## Use

```svelte
<script>
  import { Checkbox, Fieldset } from "@indy-center/svelte";

  let onRoster = $state(true);
</script>

<Checkbox label="Show on the roster" name="roster" bind:checked={onRoster} />

<Fieldset legend="Emails">
  <Checkbox label="Events" name="emails" value="events" />
  <Checkbox label="Training" name="emails" value="training" />
</Fieldset>
```

## Props

| Prop      | Type                 | Notes                                                                                    |
| --------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `label`   | `string`             | Required. The text beside the box, which names it.                                       |
| `checked` | `boolean`            | Bindable: `bind:checked`. `false` when left out.                                         |
| `class`   | `string`             | Added to the row (the `<label>`) after its own classes. Layout only.                     |
| others    | `<input>` attributes | Passed to the `<input>`: `name`, `value`, `disabled`, `required`, `aria-*` and the rest. |

## Looks

- The browser's own box, ticked in `primary` (`accent-color`), in each
  scheme.
- The label in `foreground-soft`, at body size, beside the box.
- A `ring` outline round the box when focused.
- The row is at least 44px tall, and all of it ticks the box. Disabled,
  the row dims.

## Accessibility

- It renders a native `<input type="checkbox">` inside its `<label>`, so
  the label names it, a screen reader says whether it's ticked, and Space
  toggles it.
- To give it an error, put it in a `Fieldset` with `error`.
