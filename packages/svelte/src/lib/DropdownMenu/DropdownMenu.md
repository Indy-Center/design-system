---
title: DropdownMenu
description: A button with an arrow that opens a short list of actions or links; alone, or as the arrow half of a split button.
---

## Checklist

- [ ] Use it for a few actions on one thing, such as a row's "Withdraw"
      and "Remove", when buttons for each would crowd the page. Keep the
      main action a `Button` of its own, with the menu attached beside it
      as a split button. For the site's own menus use `AppsMenu` and
      `UserMenu`; to show more content, use `Disclosure`.
- [ ] Give `label` as what the arrow opens, naming the thing: "More
      actions for Jo Rivera". Screen readers read it in place of `text`.
- [ ] Give `text` ("Actions") for words beside the arrow; leave it out for
      an arrow alone, attached to a button.
- [ ] For a split button, put the menu straight after its `Button`, with
      `attached`, the same `variant`, and `class="rounded-r-none"` on the
      `Button`, both in a `flex` row.
- [ ] Make each row a `DropdownMenuItem`: with `href` to go somewhere,
      without it to do something. A form's submit `<button>` works as a
      row too. Write rows as verbs: "Withdraw", not "Withdrawal".
- [ ] Choosing a row closes the menu. Don't put a field or a second menu
      in it.
- [ ] Don't colour it or change its sizes. `class` is for layout only, on
      the arrow.

## Use

```svelte
<script>
  import { Button, DropdownMenu, DropdownMenuItem } from "@indy-center/svelte";
</script>

<div class="flex">
  <Button class="rounded-r-none">Approve</Button>
  <DropdownMenu label="More actions for Jo Rivera" attached variant="primary">
    <DropdownMenuItem href="/roster/1000001">View profile</DropdownMenuItem>
    <form method="POST" action="?/withdraw">
      <DropdownMenuItem type="submit">Withdraw</DropdownMenuItem>
    </form>
  </DropdownMenu>
</div>

<DropdownMenu label="Actions for this event" text="Actions">
  <DropdownMenuItem onclick={copyLink}>Copy link</DropdownMenuItem>
</DropdownMenu>
```

## Props

### DropdownMenu

| Prop       | Type                         | Notes                                                                                                   |
| ---------- | ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| `label`    | `string`                     | Required. The arrow's name for screen readers: what it opens.                                           |
| `text`     | `string`                     | Words shown beside the arrow. An arrow alone when left out.                                             |
| `attached` | `boolean`                    | The arrow half of a split button, flush against the `Button` before it.                                 |
| `variant`  | `"primary"` \| `"secondary"` | Matches the `Button` it's attached to. `secondary` by default.                                          |
| `children` | `Snippet`                    | Required. The rows: `DropdownMenuItem`s.                                                                |
| `class`    | `string`                     | Added to the arrow. Layout only.                                                                        |
| others     | `<button>` attributes        | Passed to the arrow: `id`, `disabled`, `aria-*` and the rest. Its `onclick` and `onfocusout` are taken. |

### DropdownMenuItem

| Prop       | Type                           | Notes                                               |
| ---------- | ------------------------------ | --------------------------------------------------- |
| `href`     | `string`                       | Makes the row a link. A `<button>` when left out.   |
| `children` | `Snippet`                      | Required. The row's words, and an `Icon` if wanted. |
| `class`    | `string`                       | Added after the row's own classes. Layout only.     |
| others     | `<a>` or `<button>` attributes | Passed to the row: `onclick`, `type`, `disabled`.   |

## Looks

- The arrow looks like `Button`: `secondary` has an `input` border and
  `foreground` text, `muted` on hover; `primary` is filled `primary` with
  `primary-foreground` text. A chevron turns over while the menu is open.
  Attached, a `primary` arrow has a `primary-hover` line on its left, and
  a `secondary` one shares its button's border.
- The menu is on `card` with a `border` line and a shadow, 14rem wide,
  under the arrow with its right edge on the arrow's. Near the window's
  edge it opens the other way, so it stays in sight.
- Rows are `foreground` text, `muted` on hover, with a `ring` outline when
  reached by keyboard.

## Accessibility

- It is a disclosure, not an ARIA menu: a `<button aria-expanded>` that
  shows a list of links and buttons. The rows are reached with Tab, as on
  the rest of the page; there are no arrow keys to learn.
- The menu is a `popover`, drawn above the page, so a table or a card
  can't clip it. It follows the arrow in the page's order, so Tab goes
  from the arrow into the rows.

| Key                         | What it does                                                 |
| --------------------------- | ------------------------------------------------------------ |
| Enter or Space on the arrow | Opens the menu, or closes it.                                |
| Tab                         | Moves through the rows; past the last, closes the menu.      |
| Escape                      | Closes the menu and puts focus back on the arrow.            |
| Enter on a row              | Follows the link or presses the button, and closes the menu. |

- A click outside the menu closes it. Choosing a row puts focus back on
  the arrow.
- The arrow and every row are at least 44px tall and wide.
- The chevron is hidden from screen readers; `label` names the arrow.
