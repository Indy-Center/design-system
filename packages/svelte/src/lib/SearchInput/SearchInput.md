---
title: SearchInput
description: A labelled search box with a search icon, for filtering a list on the page.
---

## Checklist

- [ ] Use it to search or filter a list: the roster, the users table, the
      waitlist. For picking one item from a search (a controller, a
      position), use `Combobox`. For a search box in a form with a hint or
      an error, use `Field` and `Input type="search"`.
- [ ] Always give a `label` that says what is searched: "Search the
      roster", not "Search". Use `hideLabel` only where the bar around it
      makes the purpose plain; screen readers still read the label.
- [ ] A placeholder is an example ("Name or CID"), not the label: it goes
      when the member types.
- [ ] Don't colour it: no `bg-*`, `border-*` or `text-*` classes. `class`
      is for layout only, such as `sm:w-64`; it fills its container's width
      by default.
- [ ] In a bar with filters and a sort, build it from `SearchInput`,
      `FilterChip` and `Select`, as below.

## Use

```svelte
<script>
  import { SearchInput } from "@indy-center/svelte";

  let query = $state("");
</script>

<SearchInput
  label="Search the roster"
  placeholder="Name or CID"
  bind:value={query}
/>
```

A search-and-filter bar: the search, a chip per filter, and a `Select`
for the sort. On a phone the parts wrap onto their own lines.

```svelte
<script>
  import { FilterChip, SearchInput, Select } from "@indy-center/svelte";

  let query = $state("");
  let onlineOnly = $state(false);
  let visitors = $state(true);
  let sort = $state("initials");
</script>

<div class="flex flex-wrap items-center gap-3">
  <SearchInput
    label="Search the roster"
    hideLabel
    placeholder="Name or CID"
    bind:value={query}
    class="w-full sm:w-64"
  />
  <div role="group" aria-label="Show" class="flex flex-wrap gap-2">
    <FilterChip bind:pressed={onlineOnly}>Online only</FilterChip>
    <FilterChip bind:pressed={visitors} count={14}>Visitors</FilterChip>
  </div>
  <Select aria-label="Sort by" bind:value={sort} class="sm:ml-auto sm:w-48">
    <option value="initials">Initials</option>
    <option value="name">Name</option>
    <option value="rating">Rating</option>
  </Select>
</div>
```

## Props

| Prop        | Type                 | Notes                                                                                  |
| ----------- | -------------------- | -------------------------------------------------------------------------------------- |
| `label`     | `string`             | Required. Names the box.                                                               |
| `hideLabel` | `boolean`            | Hides the label from sight, not from screen readers. `false` by default.               |
| `value`     | `string`             | Bindable: `bind:value`.                                                                |
| `id`        | `string`             | The box's id; one is made when left out.                                               |
| `class`     | `string`             | On the outer box that holds the label and the input, since it is for layout.           |
| others      | `<input>` attributes | Passed to the `<input>`: `name`, `placeholder`, `autocomplete`, `aria-*` and the rest. |

## Looks

- The box is `Input`'s: fill `muted`, border `input`, text `foreground`,
  placeholder `placeholder`, a `ring` outline when focused, 44px tall
  and 16px text, in each scheme.
- The label is `Field`'s: `foreground-soft`, small and medium weight.
- A magnifying glass in `muted-foreground` at the box's start; the text
  begins after it.
- The browser's own clear button stays at the end of the box.

## Accessibility

- It renders a `<label>` and a native `<input type="search">`, so it is
  a searchbox named by the label. Escape clears it, as the browser does.
- The icon is hidden from screen readers; the label does the naming.
- Filtering as the member types changes the list without moving focus.
  Say how many results there are in a `role="status"` region near the
  list ("12 controllers"), so screen readers hear the change.
- A whole-site search form goes in a `<search>` element (or
  `role="search"`); a bar that filters one list doesn't need one.
