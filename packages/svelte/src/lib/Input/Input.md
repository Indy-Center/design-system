---
title: Input
description: A one-line text, number, date or time box on the input roles.
---

## Checklist

- [ ] Put it in a `Field`, which gives it its label, hint and error. For
      a search box in a filter bar, use `SearchInput`, which brings its
      own label and icon.
- [ ] Pick the `type` for the value: `search` for a search box in a form, `url`,
      `number`, `date`, `time` or `datetime-local`. The browser's own
      pickers stay; there is no date-picker library.
- [ ] A placeholder is an example, not the label or the hint: it goes when
      the member types.
- [ ] Don't colour it: no `bg-*`, `border-*` or `text-*` classes. `class`
      is for layout only, such as a margin or `max-w-xs`; it fills its
      container's width by default.
- [ ] Mark an error through `Field`'s `error`, not a red class.

## Use

```svelte
<script>
  import { Field, Input } from "@indy-center/svelte";

  let callsign = $state("");
</script>

<Field label="Callsign" hint="As you log on to VATSIM." required>
  {#snippet children(control)}
    <Input {...control} name="callsign" bind:value={callsign} />
  {/snippet}
</Field>

<Input type="search" aria-label="Search the roster" placeholder="Name or CID" />
```

## Props

| Prop    | Type                 | Notes                                                                                            |
| ------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| `type`  | `string`             | `text` (the default), `search`, `url`, `number`, `date`, `time` or `datetime-local`.             |
| `value` | `string \| number`   | Bindable: `bind:value`.                                                                          |
| `class` | `string`             | Added after Input's own classes. Layout only.                                                    |
| others  | `<input>` attributes | Passed to the `<input>`: `name`, `placeholder`, `min`, `max`, `disabled`, `aria-*` and the rest. |

For checkboxes and radios, use `Checkbox` and `Radio`.

## Looks

- Fill `muted`, border `input`, text `foreground`, placeholder
  `placeholder`, in each scheme; the roles switch inside the dark header
  by themselves.
- A `ring` outline when focused.
- A `destructive` border when `aria-invalid` is set, which `Field` does
  when it has an error. The error's text and icon say it too, so it isn't
  colour alone.
- 44px tall at least, and 16px text, so phones don't zoom in on focus.

### Beside `@tailwindcss/forms`

Input doesn't need the forms plugin. Where an app still loads it with its
default `base` strategy, the plugin styles every input first. Input's
classes, which are utilities, win for the fill, border, padding and
outline, but the plugin's blue focus ring (a `box-shadow`) still shows
beside Input's own outline. While old forms still use the plugin, load it
with `@plugin "@tailwindcss/forms" { strategy: "class"; }`, so it only
styles elements with its `form-*` classes and leaves the components alone.
Drop it once the app's forms use these components.

## Accessibility

- It renders a native `<input>`, so its role, keyboard and the browser's
  pickers come from the browser.
- Its name comes from `Field`'s label, or from your `aria-label` when used
  alone. A placeholder is not a name.
