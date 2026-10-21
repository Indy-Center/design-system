---
title: ChoiceCard
description: A radio or checkbox drawn as a card, with room under its label to say more, highlighted when chosen.
---

## Checklist

- [ ] Use cards when each option needs a line or two of explanation
      (certifications, course tracks), or should stand out as a big
      target. For short options, use `Radio` or `Checkbox`.
- [ ] Choose `type="radio"` for one of several, `type="checkbox"` for any
      number. It follows the same rules as `Radio` and `Checkbox`.
- [ ] Put the cards in a `Fieldset`, whose legend asks the question, and
      give the group's error and `required` to the `Fieldset`.
- [ ] For radios, give every card the same `name` and `bind:group` to the
      same variable.
- [ ] Put the option's name in `label`, short; put the explanation in the
      children, as text. Don't put links or buttons in a card: a click
      anywhere on it picks it.
- [ ] Don't colour it: no `bg-*`, `border-*` or `text-*` classes. `class`
      is for layout only, such as a width.

## Use

```svelte
<script>
  import { ChoiceCard, Fieldset } from "@indy-center/svelte";

  let { data } = $props();
  let certification = $state(data.certification ?? "");
</script>

<Fieldset legend="Certification" required>
  {#each data.certifications as cert (cert.code)}
    <ChoiceCard
      type="radio"
      label={cert.name}
      name="certification"
      value={cert.code}
      bind:group={certification}
    >
      {cert.description}
    </ChoiceCard>
  {/each}
  <ChoiceCard
    type="radio"
    label="No certification"
    name="certification"
    value=""
    bind:group={certification}
  />
</Fieldset>

<Fieldset legend="Emails">
  <ChoiceCard type="checkbox" label="Events" name="emails" value="events">
    Group flights, fly-ins and FNOs.
  </ChoiceCard>
</Fieldset>
```

## Props

| Prop       | Type                    | Notes                                                                                      |
| ---------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| `type`     | `"radio" \| "checkbox"` | Required. A `Radio` inside for one of several, a `Checkbox` for any number.                |
| `label`    | `string`                | Required. The option's name, which names the input.                                        |
| `children` | `Snippet`               | More about the option, small, under the label. Read as its description, not its name.      |
| `name`     | `string`                | The form field's name. Required for radios: the same on every card in the group.           |
| `value`    | `string \| number`      | Radios: required, this card's value (see `Radio`). Checkboxes: a string, sent when ticked. |
| `group`    | same as `value`         | Radios only. Bindable: `bind:group`. The chosen card's value.                              |
| `checked`  | `boolean`               | Checkboxes only. Bindable: `bind:checked`. `false` when left out.                          |
| `class`    | `string`                | Added to the card (its outer box) after its own classes. Layout only.                      |
| others     | `<input>` attributes    | Passed to the `<input>`: `disabled`, `required`, `onchange`, `aria-*` and the rest.        |

## Looks

- A rounded card edged in `border`, with no fill of its own, so it sits on
  the page or a card. On hover, the edge darkens to `input`.
- Chosen or ticked: edged in `primary`, over a wash of `primary` at 10%.
  The radio's or checkbox's own mark shows the choice too, so it isn't
  colour alone.
- Inside, the `Radio` or `Checkbox` look: the mark in `primary`, the label
  in `foreground-soft`, the children small in `muted-foreground`, a `ring`
  outline round the mark when focused.
- At least 44px tall, and all of it, padding included, picks the option.
  Disabled, the whole card dims.
- Stacked, each card but the last keeps a 12px gap below it, so cards in
  a `Fieldset` don't touch. Laying them out in a grid instead, pass
  `class="not-last:mb-0"` and space them with the grid's `gap`.

## Accessibility

- It renders a `Radio` or `Checkbox`, whose `<label>` fills the card: a
  native input, named by `label` alone and described by the children.
- The keyboard is the native one: for radios, Tab enters the group and
  the arrow keys move and choose; Space picks the focused card, and
  toggles a checkbox.
- The `Fieldset`'s legend names the group. Its error marks checkboxes
  `aria-invalid`; radios hear it as the group's description.
