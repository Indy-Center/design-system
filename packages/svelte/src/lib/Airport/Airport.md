---
title: Airport
description: An airport's code in mono with its name muted beside it, or the code alone with the name in a tooltip.
---

## Checklist

- [ ] Use it wherever a page names an airport: a weather list, a
      scenario, an event. Inside a `Position`, pass the airport to
      `Position` instead.
- [ ] Pass an `AirportInfo`, `{ code, name }`, with the ICAO code
      (`KIND`). The app gives the name; `Airport` doesn't look it up.
- [ ] Leave the name inline (the default) for most pages. Use
      `nameAt="tooltip"` only for an expert audience that knows the codes,
      such as controllers' tools: a phone user never sees a tooltip.
- [ ] With `nameAt="tooltip"`, add `focusable` where a page has only a
      few airports, so a keyboard can reach the name. Leave it off in a
      list, which would get a tab stop per row. Screen readers read the
      name either way.
- [ ] Don't colour it: the code takes the text around it. `class` is for
      layout only.

## Use

```svelte
<script>
  import { Airport } from "@indy-center/centerline-svelte";
</script>

<!-- KIND Indianapolis International -->
<Airport airport={{ code: "KIND", name: "Indianapolis International" }} />

<!-- KIND, the name on hover -->
<Airport
  airport={{ code: "KIND", name: "Indianapolis International" }}
  nameAt="tooltip"
/>
```

## Props

| Prop        | Type                    | Notes                                                                                           |
| ----------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `airport`   | `AirportInfo`           | Required. `{ code: "KIND", name: "Indianapolis International" }`; `name` is optional.           |
| `nameAt`    | `"inline" \| "tooltip"` | `"inline"` by default: the name after the code. `"tooltip"`: the code alone, the name on hover. |
| `focusable` | `boolean`               | With `"tooltip"`, makes the code a tab stop. `false` by default.                                |
| `class`     | `string`                | Layout only: on its root, or with `"tooltip"` on the `Tooltip` box round the code.              |
| others      | global attributes       | `id`, `aria-*` and the rest: on its root `<span>`, or with `"tooltip"` on the `<abbr>`.         |

## What it shows

- Inline: `KIND Indianapolis International`.
- In a tooltip: `KIND`, with "Indianapolis International" above it on
  hover, and on keyboard focus when `focusable`.
- Without a `name`, the code alone, either way, with no tooltip or tab
  stop.

## Looks

- The code: `font-mono`, in the colour and size of the text around it.
- The name inline: `text-sm`, `muted-foreground`. It passes 4.5:1 on the
  page and on a card in every scheme.
- The tooltip: `Tooltip`'s look, `background` on `foreground`. When
  `focusable`, a `ring` outline goes round the code on keyboard focus.

## Accessibility

- Inline: a `<span>` of text; a screen reader reads "KIND Indianapolis
  International".
- In a tooltip, as `Rating` and `Credential`: an `<abbr>` holding the code
  and, after it, the name in visually hidden text, so a screen reader
  reads "KIND Indianapolis International" too, with or without
  `focusable`. The name is read once: the `<abbr>` has no `title`, the
  tooltip is `aria-hidden`, and the `<abbr>` doesn't take Tooltip's
  `aria-describedby`.
- With `focusable`, the `<abbr>` takes focus (`tabindex="0"`); Escape
  hides the tooltip. It isn't a control, so it is exempt from the 44px
  target size.
- Readers may spell the code out or say it as a word.
