---
title: Field
description: A form control's label, hint and error, wired to the control so screen readers announce them.
---

## Checklist

- [ ] Wrap every `Input`, `Textarea` and `Select` that has a visible label
      in a `Field`, and spread what it hands you onto the control:
      `{#snippet children(control)}<Input {...control} />{/snippet}`.
      Don't write `<label>`, `id`, `for` or `aria-describedby` yourself.
- [ ] Write the label as a short noun ("Callsign"), with no colon or `*`.
      Set `required` and Field writes "(required)" in words.
- [ ] Put help in `hint`: the format, or what the value is for. Not in the
      placeholder.
- [ ] Put a validation message in `error`, saying how to fix it ("Enter a
      callsign such as IND_CTR"), and leave it unset when the value is
      fine. Field marks the control invalid while it is set.
- [ ] For a group of radios or checkboxes, use `Fieldset`, not `Field`.
- [ ] Don't colour the label, hint or error. `class` is for layout only,
      such as a margin or grid column.

## Use

```svelte
<script>
  import { Field, Input } from "@indy-center/svelte";

  let { form } = $props();
</script>

<Field
  label="Callsign"
  hint="As you log on to VATSIM."
  error={form?.errors?.callsign}
  required
>
  {#snippet children(control)}
    <Input {...control} name="callsign" value={form?.callsign ?? ""} />
  {/snippet}
</Field>
```

Field also wires your own control: spread `control` on any element that
takes an `id` and `aria-*` attributes. Spread all of it, `required`
included: the "(required)" by the label is hidden from screen readers.
Don't set your own `aria-describedby` on the control as well; one would
replace the other, so put the text in `hint`.

## Props

| Prop       | Type                      | Notes                                                                     |
| ---------- | ------------------------- | ------------------------------------------------------------------------- |
| `label`    | `string`                  | Required. The label's text.                                               |
| `hint`     | `string`                  | Shown under the control, and read as its description.                     |
| `error`    | `string`                  | Shown under the hint, read after it, and marks the control invalid.       |
| `required` | `boolean`                 | Writes "(required)" by the label and sets `required` on the control.      |
| `id`       | `string`                  | The control's id. One is made when left out; set it to link to the field. |
| `children` | `Snippet<[FieldControl]>` | The control. Spread its argument onto it.                                 |
| `class`    | `string`                  | Added to the wrapping `<div>` after Field's own classes. Layout only.     |
| others     | `<div>` attributes        | Passed to the wrapping `<div>`.                                           |

`FieldControl`, exported from the package, is what `children` receives:
`id`, `aria-describedby` (the hint's and error's ids, when there are any),
`aria-invalid` (`true` while there is an error) and `required`.

## Looks

- Label: small, medium weight, `foreground-soft`; "(required)" in
  `muted-foreground`.
- Hint: small, `muted-foreground`, under the control.
- Error: small, `destructive`, with an alert icon so it isn't colour
  alone, under the hint. The control's border turns `destructive` too.
- Label, control, hint and error stack with a small gap; there is no
  margin around the Field, so space fields with the form's own `gap` or
  `space-y`.

## Accessibility

- The `<label for>` names the control, and clicking it focuses the
  control.
- `aria-describedby` points at the hint and the error, so a screen reader
  reads them after the name; `aria-invalid` makes it say the value is
  invalid.
- "(required)" is hidden from screen readers, because the control's own
  `required` already says it.
- The ids come from Svelte's `$props.id()`, so they match between the
  server's HTML and the browser.
- Field doesn't move focus or announce new errors. After a failed submit,
  the page should show a summary or focus the first invalid control.
