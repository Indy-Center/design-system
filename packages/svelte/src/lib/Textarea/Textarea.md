---
title: Textarea
description: A multi-line text box on the input roles.
---

## Checklist

- [ ] Use it for text that can run to more than one line: comments,
      feedback, notes. For one line, use `Input`.
- [ ] Put it in a `Field`, which gives it its label, hint and error. Used
      alone, give it an `aria-label`.
- [ ] Set `rows` to about the length you expect.
- [ ] Don't colour it: no `bg-*`, `border-*` or `text-*` classes. `class`
      is for layout only; it fills its container's width by default.

## Use

```svelte
<script>
  import { Field, Textarea } from "@indy-center/centerline-svelte";

  let comments = $state("");
</script>

<Field label="Comments" hint="What went well, and what to work on.">
  {#snippet children(control)}
    <Textarea {...control} name="comments" rows={5} bind:value={comments} />
  {/snippet}
</Field>
```

## Props

| Prop    | Type                    | Notes                                                                                |
| ------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `value` | `string`                | Bindable: `bind:value`.                                                              |
| `class` | `string`                | Added after Textarea's own classes. Layout only.                                     |
| others  | `<textarea>` attributes | Passed to the `<textarea>`: `name`, `rows`, `maxlength`, `placeholder` and the rest. |

## Looks

The same as `Input`: fill `muted`, border `input`, text `foreground`,
placeholder `placeholder`; a `ring` outline when focused; a `destructive`
border when `aria-invalid` is set. The member can drag it taller.

Beside `@tailwindcss/forms`: as for `Input`, its classes win over the
plugin's `base` styles except the plugin's focus ring, so load the plugin
with its `class` strategy while old forms still use it.

## Accessibility

- It renders a native `<textarea>`; Enter makes a new line and Tab moves
  on.
- Its name comes from `Field`'s label, or from your `aria-label` when used
  alone.
