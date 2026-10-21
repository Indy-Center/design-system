---
title: FilterChip
description: A filter that is on or off, shown as a chip that says which it is.
---

## Checklist

- [ ] Use it for a filter on a list that is on or off: a status on the
      waitlist, "Online only" on the roster. For a choice of one sort or
      one course, use `Select`; for a setting saved with a form, use
      `Switch` or `Checkbox`. For a code that only labels something, use
      `Chip`.
- [ ] Bind `pressed` to the state that filters the list:
      `bind:pressed={onlineOnly}`. It flips itself when pressed.
- [ ] Write the text as what the filter shows ("Waiting", "Online only"),
      so on reads as shown and off, struck through, as hidden.
- [ ] Give `count` when it helps: how many rows the filter covers, before
      any filtering, so an off chip still says how many it is hiding.
- [ ] Put a row of chips in a `role="group"` with an `aria-label` that
      says what they filter ("Show", "Statuses").
- [ ] Don't colour it: `class` is for layout only, such as a margin.

## Use

```svelte
<script>
  import { FilterChip } from "@indy-center/svelte";

  let waiting = $state(true);
  let enrolled = $state(true);
  let withdrawn = $state(false);
</script>

<div role="group" aria-label="Statuses" class="flex flex-wrap gap-2">
  <FilterChip bind:pressed={waiting} count={12}>Waiting</FilterChip>
  <FilterChip bind:pressed={enrolled} count={4}>Enrolled</FilterChip>
  <FilterChip bind:pressed={withdrawn} count={2}>Withdrawn</FilterChip>
</div>
```

`SearchInput`'s page shows a whole search-and-filter bar: the search,
chips and a `Select` for the sort.

## Props

| Prop       | Type                  | Notes                                                                              |
| ---------- | --------------------- | ---------------------------------------------------------------------------------- |
| `pressed`  | `boolean`             | Whether the filter is on. Bindable; flips itself when pressed. `false` by default. |
| `count`    | `number`              | Shown after the text, in brackets, and read as part of the name: "Waiting (12)".   |
| `children` | `Snippet`             | The filter's text.                                                                 |
| `onclick`  | `function`            | Runs after the chip has flipped.                                                   |
| `class`    | `string`              | Added after FilterChip's own classes. Layout only.                                 |
| others     | `<button>` attributes | Passed to the `<button>`: `disabled`, `aria-controls` and the rest.                |

## Looks

- On: a `primary` border on a 10% `primary` tint, with `foreground`
  text, as a checked `ChoiceCard`.
- Off: an `input` border, no fill, `muted-foreground` text, struck
  through, so off isn't shown by colour alone. On hover, a `muted` fill
  with `foreground-soft` text, which stays 4.5:1.
- A `ring` outline when reached by keyboard; 44px tall and wide at least.
- Each state's text is 4.5:1 or more on the page and on a card, in each
  scheme.

## Accessibility

- It renders a `<button type="button" aria-pressed>`, so screen readers
  read it as a toggle button, pressed or not. Tab reaches it; Space and
  Enter flip it.
- The name is the text and the count. Keep the text the same in both
  states: `aria-pressed` says the state, so don't add "on" or "off".
- Filtering the list doesn't move focus. Say how many results there are
  in a `role="status"` region near the list.
