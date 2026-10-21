---
title: StarRating
description: A rating out of five stars, to choose (StarRating) or to show (StarDisplay).
---

## Checklist

- [ ] Use `StarRating` when a member rates something out of five, such as
      a student rating their teacher. For a choice between named options,
      use `Radio`s in a `Fieldset`.
- [ ] Use `StarDisplay` to show a rating or an average that can't be
      changed. For a number that isn't out of five, write the number.
- [ ] `StarDisplay` shows only stars. Where members need the exact figure
      or a word for it ("4.3 avg", "Excellent"), write it beside them.
- [ ] Write the legend as the question ("How was your session?"). Don't
      add a label for each star: they are named "1 star" to "5 stars".
      An app that stores words ("Poor" to "Excellent") maps the number to
      them on save.
- [ ] Give each `StarRating` its own `name`, and `bind:value`. Its value
      is a number from 1 to 5, or `undefined` while no star is chosen.
- [ ] For a rating the form must have, set `required`.
- [ ] Don't colour or resize the stars. `class` is for layout only.
      `StarDisplay`'s stars take the size of the text around them.

## Use

```svelte
<script>
  import { StarDisplay, StarRating } from "@indy-center/svelte";

  let rating = $state();
</script>

<form method="post">
  <StarRating
    legend="How was your session?"
    name="rating"
    required
    bind:value={rating}
  />
</form>

<StarDisplay value={4.3} />
```

## Props

### StarRating

| Prop       | Type                    | Notes                                                                        |
| ---------- | ----------------------- | ---------------------------------------------------------------------------- |
| `legend`   | `string`                | Required. The question, which names the group.                               |
| `name`     | `string`                | Required. The radios' name; the form sends the stars chosen, `"1"` to `"5"`. |
| `value`    | `number \| undefined`   | Bindable. The stars chosen, 1 to 5.                                          |
| `required` | `boolean`               | Says "(required)" by the legend and makes the radios required.               |
| `hint`     | `string`                | A line under the stars, read as the group's description.                     |
| `error`    | `string`                | What's wrong, under the stars, read after the hint.                          |
| `disabled` | `boolean`               | Dims the stars; none can be chosen.                                          |
| `class`    | `string`                | Added to the `<fieldset>`. Layout only.                                      |
| others     | `<fieldset>` attributes | Passed to the `<fieldset>`.                                                  |

### StarDisplay

| Prop    | Type                | Notes                                                                                                                  |
| ------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `value` | `number`            | Required. 0 to 5, held to that range; drawn to the nearest half star and read to one decimal. `NaN` reads "Not rated". |
| `class` | `string`            | Added to the `<span>`. Layout only.                                                                                    |
| others  | `<span>` attributes | Passed to the `<span>`. An `aria-label` replaces the words ("Excellent, 5 out of 5").                                  |

## Looks

- Chosen or lit stars are filled, in `warning`; the rest are outlines,
  in `muted-foreground`. The shape differs as well as the colour.
- `StarRating`'s stars are 32px, each in a 44px target. Under the pointer,
  the stars up to the one hovered light as a preview. Beside them, small
  `muted-foreground` text says the value in words ("4 out of 5"), or
  "Not rated".
- A `ring` outline round the focused star.
- The legend, hint and error are `Fieldset`'s.
- `StarDisplay` draws a half star for a half; its stars are 1em.

## Accessibility

- `StarRating` renders a `Fieldset` (`<fieldset>` and `<legend>`) of five
  native radios, named "1 star" to "5 stars". The radios are visually
  hidden; the star round each is its label, so clicking it chooses.
- The browser gives it the radio group's keyboard: Tab enters at the
  chosen star (the first, when none is) and leaves after the group; the
  arrow keys move and choose, wrapping from 5 to 1; Space chooses the
  focused star.
- The words beside the stars are hidden from screen readers, since the
  checked radio already says how many.
- `StarDisplay` renders a `<span role="img">` named by the value in words,
  to one decimal ("4.3 out of 5", drawn as four and a half stars), or "Not
  rated"; its stars are hidden from screen readers.
- The radios carry no `aria-invalid`, as `Radio`'s don't; the error is in
  the group's description.
