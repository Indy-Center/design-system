---
title: Fieldset
description: A group of radios or checkboxes with a legend, hint and error, wired so screen readers announce them.
---

## Checklist

- [ ] Put every group of `Radio`s in a `Fieldset`, and any list of
      `Checkbox`es that answer one question. For a single text box or
      select, use `Field`.
- [ ] Write the legend as the question, as a short noun ("Position"),
      with no colon or `*`. Set `required` and Fieldset writes
      "(required)" in words, and makes each `Radio` in it required, so
      the browser won't send the form with none chosen. Checkboxes stay
      optional: `required` on a box would make every box compulsory.
- [ ] Put help in `hint`, and a validation message in `error` saying how
      to fix it ("Choose a position"). Leave `error` unset when the choice
      is fine.
- [ ] Don't colour the legend, hint or error. `class` is for layout
      only, such as a margin.

## Use

```svelte
<script>
  import { Fieldset, Radio } from "@indy-center/centerline-svelte";

  let { form } = $props();
  let position = $state(form?.position);
</script>

<Fieldset
  legend="Position"
  hint="The one you'll train on first."
  error={form?.errors?.position}
  required
>
  <Radio label="Ground" name="position" value="gnd" bind:group={position} />
  <Radio label="Tower" name="position" value="twr" bind:group={position} />
</Fieldset>
```

## Props

| Prop       | Type                    | Notes                                                                                                  |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `legend`   | `string`                | Required. The legend's text, which names the group.                                                    |
| `hint`     | `string`                | Shown under the options, and read as the group's description.                                          |
| `error`    | `string`                | Shown under the hint, read after it, and marks each `Checkbox` in it invalid.                          |
| `required` | `boolean`               | Writes "(required)" by the legend, read as part of the group's name, and makes each `Radio` required.  |
| `children` | `Snippet`               | The options: `Radio`s or `Checkbox`es.                                                                 |
| `class`    | `string`                | Added to the `<fieldset>` after its own classes. Layout only.                                          |
| others     | `<fieldset>` attributes | Passed to the `<fieldset>`: `disabled` (which disables every option), `aria-describedby` and the rest. |

## Looks

- Legend: small, medium weight, `foreground-soft`, like `Field`'s label;
  "(required)" in `muted-foreground`.
- The options stack under it, each a 44px row.
- Hint: small, `muted-foreground`. Error: small, `destructive`, with an
  alert icon so it isn't colour alone.
- No border, fill or margin of its own: space it with the form's own
  `gap` or `space-y`.

## Accessibility

- It renders a native `<fieldset>` and `<legend>`, so the group's role and
  name come from the browser, and a screen reader reads the legend on
  entering the group.
- `aria-describedby` on the `<fieldset>` points at the hint and the
  error, after any ids you pass. With an error, each `Checkbox` in it
  takes `aria-invalid`. A radio can't take `aria-invalid`, nor can the
  group, so for radios the error's text, read as the group's
  description, says what's wrong.
- "(required)" is part of the legend, so a screen reader reads it with
  the group's name. That's the only way a checkbox group says it; in a
  radio group, each radio's own `required` says it again.
- The ids come from Svelte's `$props.id()`, so they match between the
  server's HTML and the browser.
