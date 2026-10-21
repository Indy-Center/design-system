---
title: Checkbox
description: A native checkbox with its label beside it, ticked in the primary role.
---

## Checklist

- [ ] Use it for a yes-or-no choice that takes effect when the form is
      sent, or for picking any number of options from a list. For one of
      several options, use `Radio`s.
- [ ] Put a list of checkboxes in a `Fieldset`, whose legend says what
      they choose, and give the list's error to the `Fieldset`. A single
      checkbox, such as a consent box, can stand alone with its own
      `error`.
- [ ] Write the label as what's true when it's ticked ("Show on the
      roster"), not a question.
- [ ] Don't colour it: no `accent-*`, `text-*` or size classes. `class`
      is for layout only, such as a margin.

## Use

```svelte
<script>
  import { Checkbox, Fieldset } from "@indy-center/svelte";

  let { form } = $props();
  let onRoster = $state(true);
</script>

<Checkbox label="Show on the roster" name="roster" bind:checked={onRoster} />

<Checkbox
  label="I've read the training policy"
  name="policy"
  required
  error={form?.errors?.policy}
/>

<Fieldset legend="Emails">
  <Checkbox label="Events" name="emails" value="events" />
  <Checkbox label="Training" name="emails" value="training" />
</Fieldset>
```

## Props

| Prop       | Type                 | Notes                                                                                    |
| ---------- | -------------------- | ---------------------------------------------------------------------------------------- |
| `label`    | `string`             | Required. The text beside the box, which names it.                                       |
| `checked`  | `boolean`            | Bindable: `bind:checked`. `false` when left out.                                         |
| `error`    | `string`             | For a box on its own: shown under the label, and marks the box invalid.                  |
| `children` | `Snippet`            | More about the option, small, under the label. Read as its description, not its name.    |
| `class`    | `string`             | Added to its outer element after its own classes. Layout only.                           |
| others     | `<input>` attributes | Passed to the `<input>`: `name`, `value`, `disabled`, `required`, `aria-*` and the rest. |

## Looks

- The browser's own box, ticked in `primary` (`accent-color`), in each
  scheme.
- The label in `foreground-soft`, at body size, beside the box. Any
  children sit under it, small, in `muted-foreground`, with the box beside
  the label's first line.
- A `ring` outline round the box when focused.
- The row is at least 44px tall, and all of it ticks the box. Disabled,
  the row dims.
- An error: small, `destructive`, under the label's text, with an alert
  icon so it isn't colour alone.

## Accessibility

- It renders a native `<input type="checkbox">` inside its `<label>`, so
  the label names it, a screen reader says whether it's ticked, and Space
  toggles it.
- With an `error`, or inside a `Fieldset` with one, the box takes
  `aria-invalid`. Its children and its own error are linked by
  `aria-describedby`, after any ids you pass; with children, the label
  alone names it (`aria-labelledby`).
