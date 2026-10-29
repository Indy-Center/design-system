---
title: Select
description: A native drop-down list of options on the input roles.
---

## Checklist

- [ ] Use it to pick one of a short, fixed list. For a list long enough
      to need typing to find a name, use `Combobox`; for two to five
      choices that should all show at once, use `Radio`s in a `Fieldset`.
- [ ] Put it in a `Field`, which gives it its label, hint and error. Used
      alone (a sort order in a filter bar), give it an `aria-label`.
- [ ] Write the options as `<option>` and `<optgroup>` elements inside it.
      To ask for a choice, start with `<option value="" disabled>Choose…</option>`.
- [ ] Don't colour it: no `bg-*`, `border-*` or `text-*` classes. `class`
      is for layout only; it fills its container's width by default.

## Use

```svelte
<script>
  import { Field, Select } from "@indy-center/centerline-svelte";

  let rating = $state("");
</script>

<Field label="Rating" required>
  {#snippet children(control)}
    <Select {...control} name="rating" bind:value={rating}>
      <option value="" disabled>Choose a rating</option>
      <option value="S1">S1</option>
      <option value="S2">S2</option>
      <option value="S3">S3</option>
    </Select>
  {/snippet}
</Field>
```

## Props

| Prop       | Type                  | Notes                                                                |
| ---------- | --------------------- | -------------------------------------------------------------------- |
| `children` | `Snippet`             | The `<option>` and `<optgroup>` elements.                            |
| `value`    | `string`              | Bindable: `bind:value`. With `multiple`, an array.                   |
| `class`    | `string`              | Added after Select's own classes. Layout only.                       |
| others     | `<select>` attributes | Passed to the `<select>`: `name`, `disabled`, `aria-*` and the rest. |

## Looks

- The same as `Input`: fill `muted`, border `input`, text `foreground`; a
  `ring` outline when focused; a `destructive` border when `aria-invalid`
  is set.
- The arrow and the open list are the browser's own, in the scheme's
  colours.

### Beside `@tailwindcss/forms`

Select's classes win over the plugin's `base` styles for the fill,
border, padding and outline. Two of the plugin's styles stay: its blue
focus ring (a `box-shadow`) beside Select's outline, and its own grey
arrow in place of the browser's, which Select's padding lets long options
run under. Load the plugin with `@plugin "@tailwindcss/forms" { strategy: "class"; }`
while old forms still use it, so it only styles elements with its
`form-*` classes and Select keeps the browser's arrow.

## Accessibility

- It renders a native `<select>`, so the browser gives it its role and
  keys: the arrow keys change the choice, and Space or Alt+Down opens the
  list.
- Its name comes from `Field`'s label, or from your `aria-label` when used
  alone.
