---
title: Combobox
description: A text box that searches a list as you type, to pick one option from it.
---

## Checklist

- [ ] Use it to pick one from many by typing: a controller, a position, a
      member. For a short fixed list (a rating, a facility), use `Select`;
      to filter a page's results, use the search box in `Input`.
- [ ] Put it in a `Field`, which gives it its label, hint and error. Used
      alone, give it an `aria-label`.
- [ ] Give `getText` (the words shown and matched) and `getKey` (unique;
      what the form sends). Both default to the option itself, for a list
      of strings.
- [ ] Pass `options` as a list to match its text by itself, or as a
      function to search your own way (several fields, a server). The
      function runs on each change to the text while the list is open, and
      only its latest answer shows; slow it down yourself if it calls a
      server.
- [ ] Draw each option with the `option` snippet for more than its text
      (a CID in `font-mono`). Keep it to one or two lines, and no links or
      buttons inside.
- [ ] Give `name` to send the pick's key with a form; the text in the box
      is not sent. With `required` (on it or its `Field`), the form won't
      send until an option is picked: typed text alone doesn't count.
- [ ] Don't colour it or its list. `class` is for layout only, on the
      wrapper round the box and its list.

## Use

```svelte
<script>
  import { Combobox, Field } from "@indy-center/svelte";

  let { data } = $props();
  let controller = $state(null);
</script>

<Field label="Controller" hint="Name, initials or CID." required>
  {#snippet children(control)}
    <Combobox
      {...control}
      name="controller"
      options={data.controllers}
      getText={(c) => c.name}
      getKey={(c) => c.cid}
      bind:value={controller}
    >
      {#snippet option(c)}
        <span class="flex-1">{c.name}</span>
        <span class="font-mono text-sm text-muted-foreground">{c.cid}</span>
      {/snippet}
    </Combobox>
  {/snippet}
</Field>
```

With a search function:

```svelte
<Combobox
  aria-label="Member"
  options={async (query) => (await fetch(`/api/members?q=${query}`)).json()}
  getText={(m) => m.name}
  getKey={(m) => m.cid}
/>
```

## Props

| Prop      | Type                                    | Notes                                                                                                                                                                                                                            |
| --------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `options` | `T[] \| (query) => T[] \| Promise<T[]>` | Required. A list is matched on `getText`, ignoring case; a function does its own search.                                                                                                                                         |
| `value`   | `T \| null`                             | Bindable: `bind:value`. The pick; null until one is made. Typing in the box clears it.                                                                                                                                           |
| `getText` | `(option: T) => string`                 | The option's words: shown in the box once picked, and matched. `String` by default.                                                                                                                                              |
| `getKey`  | `(option: T) => string`                 | Unique per option; sent with the form. `getText` by default.                                                                                                                                                                     |
| `name`    | `string`                                | Sends the pick's key with a form, from a hidden input.                                                                                                                                                                           |
| `option`  | `Snippet<[T]>`                          | Draws one option in the list. Its text when left out.                                                                                                                                                                            |
| `class`   | `string`                                | Added to the wrapper. Layout only.                                                                                                                                                                                               |
| others    | `<input>` attributes                    | Passed to the box: `id`, `placeholder`, `required`, `disabled`, `aria-*` and the rest. Your `oninput`, `onkeydown`, `onclick` and `onblur` run before the combobox's own; `preventDefault()` in `onkeydown` keeps a key from it. |

## Looks

- The box is `Input`'s: fill `muted`, border `input`, text `foreground`,
  a `ring` outline when focused, a `destructive` border when invalid, and
  a chevron in `muted-foreground` that turns over while the list is open.
- The list sits under the box on `card`, with a `border` line and a
  shadow, and scrolls past 16rem. Options are `foreground` text. The
  active option has a `muted` fill and a `ring` outline, so it isn't
  shown by colour alone.
- "Searching…", "No matches" and, when a search function throws or
  rejects, "Couldn't search" show in `muted-foreground` in the list.
- The box and each option are at least 44px tall.

## Accessibility

It follows the WAI combobox pattern for an editable box with a list and
manual selection (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/).
Focus stays in the box; `aria-activedescendant` points at the active
option.

| Key                          | What it does                                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Typing                       | Opens the list of matches, none active.                                                                                  |
| Down Arrow                   | Opens the list on the first option, or moves to the next, wrapping round.                                                |
| Up Arrow                     | Opens the list on the last option, or moves to the previous, wrapping round.                                             |
| Alt+Down Arrow               | Opens the list, none active.                                                                                             |
| Alt+Up Arrow                 | Closes the list, keeping the text; focus stays in the box.                                                               |
| Enter                        | Picks the active option and closes the list. With the list open, never sends the form.                                   |
| Escape                       | Closes the list; with it closed, clears the box and the pick. An empty box lets it through, so a dialog round it closes. |
| Home, End, Left, Right Arrow | Move the caret in the box, and leave the list.                                                                           |
| Tab                          | Closes the list and moves on, without picking.                                                                           |

- A click on the box opens the list; a click on an option picks it; a
  click outside closes it.
- While a search function is still looking for new text, the arrows
  don't move into the list it found for the old text and a click on it
  does nothing, so neither Enter nor the mouse can pick an option that no
  longer matches.
- A status region says how many options match while the list is open
  ("3 results", "No matches", "Couldn't search"), then "Ann Archer,
  selected" on a pick.
- Its name comes from `Field`'s label, or your `aria-label`.
- It has been tested by its keyboard table in a browser; a person checks it
  with a screen reader before release.
