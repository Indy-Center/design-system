---
title: Tooltip
description: A short description of a control that shows on hover and on focus.
---

## Checklist

- [ ] Use it for a word or two more about a control: what an icon button
      does, an airport code's name. Use it instead of `title=`, which a
      keyboard can't show and a phone never does.
- [ ] Don't put what a member needs to finish a task in a tooltip: write
      it on the page, or as a `Field` hint.
- [ ] The trigger must take focus: a button or a link. For text, such as
      a code, give its element `tabindex="0"`. Don't use one on a
      disabled button: it can't take focus.
- [ ] Spread the attributes the `children` snippet is given on the
      trigger, so its text becomes the trigger's description. It replaces
      any `aria-describedby` already there, so don't put it on a control
      in a `Field` that has a hint or an error.
- [ ] Write `text` as plain words, short enough for a line or two; no
      links or buttons. It is a description, not a name: an icon button
      still needs its own `aria-label`.
- [ ] Don't colour it or change its sizes. `class` is for layout only, on
      the box round the trigger.

## Use

```svelte
<script>
  import { mdiContentCopy } from "@mdi/js";
  import { Button, Icon, Tooltip } from "@indy-center/svelte";
</script>

<Tooltip text="Copies the CID to the clipboard">
  {#snippet children(trigger)}
    <Button {...trigger} variant="secondary" aria-label="Copy CID">
      <Icon path={mdiContentCopy} />
    </Button>
  {/snippet}
</Tooltip>

<Tooltip text="Indianapolis International">
  {#snippet children(trigger)}
    <!-- Focusable, so a keyboard can show its tooltip. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <abbr {...trigger} tabindex="0" class="font-mono">KIND</abbr>
  {/snippet}
</Tooltip>
```

## Props

| Prop       | Type                        | Notes                                                |
| ---------- | --------------------------- | ---------------------------------------------------- |
| `text`     | `string`                    | Required. The tooltip's words.                       |
| `children` | `Snippet<[TooltipTrigger]>` | Required. The trigger; spread what it's given on it. |
| `id`       | `string`                    | The tooltip's id; one is made when left out.         |
| `class`    | `string`                    | Added to the box round the trigger. Layout only.     |
| others     | `<span>` attributes         | Passed to the tooltip.                               |

`TooltipTrigger`, exported from the package, is
`{ "aria-describedby": string }`.

## Looks

- Small text in the page's `background` role on a `foreground` fill: dark
  with light words on a light page, light with dark words on a dark one.
- Above the trigger, centred on it; below when there's no room above.
- Up to 20rem wide; longer text wraps.

## Accessibility

- The tooltip is a `<span role="tooltip">`, and the trigger's
  `aria-describedby` points at it, so screen readers read its text after
  the trigger's name, shown or not.
- It shows while a mouse or pen is on the trigger or the trigger has
  keyboard focus (`:focus-visible`), and hides when both have left; a
  click's focus doesn't keep it up. The pointer can move onto the tooltip
  to read it without it closing.
- A tap on a touch screen doesn't show it, so a phone user never sees
  it: keep what it says nice to know.
- Escape hides it, leaving focus where it was; it shows again on the next
  hover or focus. A press elsewhere on the page hides it too.
- It is a manual `popover`, drawn above the page, so a table or a card
  can't clip it, and it doesn't close a `DropdownMenu` it sits in. It is
  placed with CSS anchor positioning; a browser without it shows the
  tooltip in a corner of the window.
