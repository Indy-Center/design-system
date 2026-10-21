---
title: Radio
description: A native radio button with its label beside it, chosen in the primary role.
---

## Checklist

- [ ] Use radios for one choice out of a few (up to about six) that
      should all show at once. For more, use `Select`; for any number of
      choices, `Checkbox`es.
- [ ] Put every group of radios in a `Fieldset`, whose legend asks the
      question ("Position"). Never a lone radio.
- [ ] Give every radio in the group the same `name`, and `bind:group` to
      the same variable. The arrow keys only move between radios with the
      same name in the same form.
- [ ] Write each label as the option itself ("Tower"), short and
      parallel.
- [ ] For a required group, set `required` on the `Fieldset`: it says so
      in words and makes each radio required, so the browser won't send
      the form with none chosen.
- [ ] Don't colour it: no `accent-*`, `text-*` or size classes. `class`
      goes on the row and is for layout only.

## Use

```svelte
<script>
  import { Fieldset, Radio } from "@indy-center/svelte";

  let position = $state("gnd");
  let seats = $state(1);
</script>

<Fieldset legend="Position" required>
  <Radio label="Ground" name="position" value="gnd" bind:group={position} />
  <Radio label="Tower" name="position" value="twr" bind:group={position} />
  <Radio label="Approach" name="position" value="app" bind:group={position} />
</Fieldset>

<Fieldset legend="Seats">
  <Radio label="One" name="seats" value={1} bind:group={seats} />
  <Radio label="Two" name="seats" value={2} bind:group={seats} />
</Fieldset>
```

## Props

| Prop       | Type                 | Notes                                                                                        |
| ---------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `label`    | `string`             | Required. The text beside the circle, which names it.                                        |
| `name`     | `string`             | Required. The group's name, the same on every radio in it.                                   |
| `value`    | `string \| number`   | Required. This radio's value. A number stays a number in `group`; the form sends it as text. |
| `group`    | same as `value`      | Bindable: `bind:group`. The chosen radio's value; this one is checked when it matches.       |
| `children` | `Snippet`            | More about the option, small, under the label. Read as its description, not its name.        |
| `class`    | `string`             | Added to the row (the `<label>`) after its own classes. Layout only.                         |
| others     | `<input>` attributes | Passed to the `<input>`: `disabled`, `required`, `onchange`, `aria-*` and the rest.          |

## Looks

- The browser's own circle, filled in `primary` (`accent-color`), in each
  scheme.
- The label in `foreground-soft`, at body size, beside the circle. Any
  children sit under it, small, in `muted-foreground`, with the circle
  beside the label's first line.
- A `ring` outline round the circle when focused.
- The row is at least 44px tall, and all of it chooses the radio.
  Disabled, the row dims.

## Accessibility

- It renders a native `<input type="radio">` inside its `<label>`, so the
  label names it and a screen reader says whether it's chosen. With
  children, the label alone names it (`aria-labelledby`) and the children
  describe it (`aria-describedby`, after any ids you pass).
- The browser gives the group its keyboard: Tab enters at the chosen
  radio (the first, when none is) and leaves after the group; the arrow
  keys move and choose; Space chooses the focused radio.
- The `Fieldset`'s legend names the group, and a screen reader reads it
  on entering. A required `Fieldset` makes each radio `required`.
- A radio can't take `aria-invalid`: the `Fieldset`'s error, read as the
  group's description, says what's wrong.
