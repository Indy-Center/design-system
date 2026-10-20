---
title: ProgressBar
description: A labelled bar showing how much of something is done, with the amount in words.
---

## Checklist

- [ ] Use it when you know how much is done: lessons passed, a file
      sent. When you don't know how long it will take, use `Spinner`.
      For a few named stages, use `Steps`.
- [ ] Give it a `label` that says what is progressing: "Course
      progress", not "Progress".
- [ ] Set `valueText` when a count reads better than a percentage:
      "3 of 8 lessons". It is shown and read out in place of "38%".
- [ ] Don't colour or resize it with classes. `class` is for layout
      only, such as a margin or width; the bar fills the width it's given.

## Use

```svelte
<script>
  import { ProgressBar } from "@indy-center/svelte";
</script>

<ProgressBar label="Course progress" value={40} />
<ProgressBar label="Lessons" value={3} max={8} valueText="3 of 8 lessons" />
```

## Props

| Prop        | Type               | Notes                                                   |
| ----------- | ------------------ | ------------------------------------------------------- |
| `label`     | `string`           | Required. Shown above the bar; names it.                |
| `value`     | `number`           | Required. How much is done, from 0 to `max`.            |
| `max`       | `number`           | 100 by default.                                         |
| `valueText` | `string`           | The value in words. A whole percentage by default.      |
| `class`     | `string`           | Added after ProgressBar's own classes. Layout only.     |
| others      | `<div>` attributes | Passed to the outer `<div>`, which holds label and bar. |

## Looks

- The label in `foreground-soft`, medium weight, and the value in words
  in `muted-foreground` at the right, both small text.
- Under them, a rounded bar 8px tall: the track in `muted`, the filled
  part in `info`. `info` rather than `primary`, because `primary` is too
  faint on the dark track; `info` keeps at least 3:1 against the track in
  both schemes.
- The percentage is kept between 0% and 100%, as the bar is.

## Accessibility

- A native `<progress>`, which readers call a progress bar. It is named
  by the label (`aria-labelledby`: a `<label for>` doesn't name a
  progress bar in every reader) and says its value as `aria-valuetext`,
  the same words shown on screen.
- The words beside the label are hidden from readers, so the value isn't
  read twice.
- It isn't a live region: readers don't announce each change. If a
  change needs announcing, say it in an `Alert` or `Toast` when it
  finishes.
