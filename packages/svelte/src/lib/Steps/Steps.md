---
title: Steps
description: A list of the stages in a process, each marked done, current or to come.
---

## Checklist

- [ ] Use it to show where someone is in a process with named stages: a
      training request, a membership application. For an amount done
      ("40%"), use `ProgressBar`. It shows progress; it isn't navigation,
      so its steps aren't links.
- [ ] Give the steps in order, first to last, each with its `state`.
      Usually one step is `current`, the ones before it `done` and the
      rest `upcoming`, but a step can be done out of order.
- [ ] Keep labels short and name what happens: "Rating exam". Put who or
      what next in `detail`, and when in `date`, already formatted.
- [ ] If the page has no heading for it, give it an `aria-label`:
      "Your training request".
- [ ] Don't change its colours or icons: each state has its own shape,
      so it isn't told by colour alone.

## Use

```svelte
<script>
  import { Steps } from "@indy-center/centerline-svelte";
</script>

<Steps
  steps={[
    { label: "Joined the waitlist", state: "done", date: "18 October 2026" },
    { label: "Training", state: "current", detail: "Teacher: Jo Bloggs" },
    { label: "Rating exam", state: "upcoming" },
  ]}
/>
```

## Props

| Prop    | Type              | Notes                                        |
| ------- | ----------------- | -------------------------------------------- |
| `steps` | `Step[]`          | Required. The steps, first to last.          |
| `class` | `string`          | Added after Steps' own classes. Layout only. |
| others  | `<ol>` attributes | Passed to the `<ol>`, such as `aria-label`.  |

A `Step`, also exported as a type:

| Field    | Type                                | Notes                          |
| -------- | ----------------------------------- | ------------------------------ |
| `label`  | `string`                            | Required. What the step is.    |
| `state`  | `"done" \| "current" \| "upcoming"` | Required.                      |
| `detail` | `string \| null`                    | A line under the label.        |
| `date`   | `string \| null`                    | Shown beside the label, small. |

## Looks

- Each step has an icon down the left, joined to the next by a line in
  `border`:
  - done: a ticked circle in `success`
  - current: a ringed dot in `info`
  - upcoming: an empty circle in `muted-foreground`
- Labels are `text-sm`: done and current in `foreground`, medium weight;
  upcoming in `muted-foreground`. Detail and date are `text-xs`
  `muted-foreground`.

## Accessibility

- An `<ol role="list">`, so readers say how many steps there are and
  where each sits in the list. The role is repeated because Safari stops
  calling a list without bullets a list.
- The current step's `<li>` has `aria-current="step"`, and its label is
  followed by "(current step)" for readers only. Not every reader says
  `aria-current` on a list item, so the words make sure it's heard; a
  reader that does may say it twice.
- A done step's label is followed by "(done)" for readers only. Upcoming
  steps say nothing extra.
- The icons and the joining line are hidden from readers.
