---
title: Switch
description: An on-or-off setting, a native checkbox read as a switch, with its label beside it.
---

## Checklist

- [ ] Use it for a setting that is on or off, such as on a settings
      page. For a choice someone confirms with a button, or a box to tick
      in a form ("I've read the policy"), use `Checkbox`.
- [ ] Write the label as the setting ("Email me about events"), not a
      question, and don't add "On" or "Off": the switch says that itself.
- [ ] When it takes effect at once, save on `onchange` and tell the member
      it's saved (a `toast`). In a form, it sends `on` under its `name`
      when on, and nothing when off, as a checkbox does.
- [ ] Put several in a `Fieldset` whose legend groups them ("Emails").
      The Fieldset's `error` marks each switch invalid, as it does
      checkboxes.
- [ ] Say more about a setting in `children`, a short line under the
      label ("About once a week"); keep the label itself short.
- [ ] Don't colour or resize it: no `bg-*`, `text-*` or size classes.
      `class` goes on the row and is for layout only.

## Use

```svelte
<script>
  import { Fieldset, Switch, toast } from "@indy-center/centerline-svelte";

  let events = $state(true);
</script>

<Fieldset legend="Emails">
  <Switch
    label="Email me about events"
    name="events"
    bind:checked={events}
    onchange={() => toast("success", "Email settings saved.")}
  />
  <Switch label="Email me about training" name="training" />
</Fieldset>
```

## Props

| Prop       | Type                 | Notes                                                                                     |
| ---------- | -------------------- | ----------------------------------------------------------------------------------------- |
| `label`    | `string`             | Required. The text beside the switch, which names it.                                     |
| `checked`  | `boolean`            | Bindable: `bind:checked`. Whether it's on; `false` when left out.                         |
| `children` | snippet              | Optional. More about the setting, in small text under the label; it describes the switch. |
| `class`    | `string`             | Added to the row (the `<label>`) after its own classes. Layout only.                      |
| others     | `<input>` attributes | Passed to the `<input>`: `name`, `value`, `disabled`, `onchange`, `aria-*` and the rest.  |

## Looks

- Off: a `muted` track edged in `input`, with a `muted-foreground` thumb
  on the left.
- On: a `primary` track with a `primary-foreground` thumb on the right,
  holding a tick in `primary`. The thumb's side and the tick show the
  state, so it isn't colour alone.
- The label in `foreground-soft`, at body size, after the switch.
- A `ring` outline round the track when focused.
- The row is at least 44px tall, and all of it flips the switch. Disabled,
  the row dims. The thumb slides only when the device allows motion.

## Accessibility

- It renders a native `<input type="checkbox" role="switch">` inside its
  `<label>`, so the label names it, a screen reader says "switch, on" or
  "off", and Space flips it.
- With `children`, the label alone names it and the children describe it
  (`aria-describedby`, after any ids you pass).
- In a `Fieldset` with an `error`, it takes `aria-invalid`.
- The thumb and tick are drawn for sight only and hidden from screen
  readers.
