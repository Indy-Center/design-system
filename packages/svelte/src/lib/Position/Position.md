---
title: Position
description: A controller position from its callsign alone, labelled by radio name, short name and sector, with its frequency.
---

## Checklist

- [ ] Use `Position` wherever a page names a controller position: a
      roster, an event's positions, a training session, a list of who's
      online. Don't write the radio name or frequency yourself: 29 of
      ZID's positions are "Indy Center", and the sector is what tells them
      apart.
- [ ] Give it the `callsign` and nothing else, as many times as the page
      needs; it looks itself up from the page's positions (see the
      positions lookup). A relief login (`IND_831_CTR`) shows as the
      position it covers, with no note: it may not be a relief.
- [ ] Use one of the two presets:
  - Controllers (the default): `show` left out, or
    `["shortName", "radioName", "name", "frequency"]`.
  - Pilots: `show={["airport", "radioName", "frequency"]}` with
    `airportAt="right"` and the position's `airport`.
- [ ] Pass `airport`, an `AirportInfo` (`{ code, name }`), for a cab
      position (its own field) and an approach (its primary airport); a
      center has none. vNAS doesn't say which, so the app does.
- [ ] Pass `radioName` or `frequency` only to override vNAS, such as a
      frequency changed for an event, or a position another ARTCC owns.
- [ ] Don't change its colours or weights. `class` is for layout.

## Use

```svelte
<script>
  import { Position } from "@indy-center/svelte";
</script>

<!-- Indy Center              128.22
     IND_83_CTR · Falmouth 83 -->
<Position callsign="IND_83_CTR" />

<!-- Lexington Tower · KLEX   119.10 -->
<Position
  callsign="LEX_TWR"
  show={["airport", "radioName", "frequency"]}
  airportAt="right"
  airport={{ code: "KLEX", name: "Blue Grass" }}
/>

<!-- Indy Center · IND_83_CTR · Falmouth 83 · 128.22 -->
<Position callsign="IND_83_CTR" layout="inline" />
```

## Props

| Prop         | Type                           | Notes                                                                                                                                    |
| ------------ | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `callsign`   | `string`                       | Required. The callsign logged in, a relief login included.                                                                               |
| `positionId` | `string`                       | The vNAS position id from the vNAS feed, when online: matched instead of the callsign.                                                   |
| `show`       | `PositionField[]`              | Any of `"shortName"`, `"airport"`, `"radioName"`, `"name"` (the sector) and `"frequency"`, in any order. Controllers' preset by default. |
| `layout`     | `"stacked" \| "inline"`        | `"stacked"` by default: two lines. `"inline"`: one line, parts between `·`, the frequency last.                                          |
| `airportAt`  | `"right" \| "left" \| "under"` | Where `airport` goes when `show` has it. `"right"` by default.                                                                           |
| `airport`    | `AirportInfo`                  | `{ code: "KLEX", name: "Blue Grass" }`; `name` is optional and shows only with `airportAt="under"`.                                      |
| `radioName`  | `string`                       | Wins over vNAS's radio name.                                                                                                             |
| `frequency`  | `number \| string`             | Wins over vNAS's frequency: hertz, or megahertz as written. Ignored if it isn't a number.                                                |
| `decimals`   | `2 \| 3`                       | The frequency's decimals; see `Frequency`.                                                                                               |
| `class`      | `string`                       | Layout only, on its root.                                                                                                                |
| others       | global attributes              | `id`, `aria-*` and the rest, on its root `<span>`.                                                                                       |

## What it shows

- **The short name** is the position's callsign (`IND_83_CTR`, for the
  relief login `IND_831_CTR` too), until vNAS publishes short names.
- **Stacked:** the radio name leads, the frequency on its right. Beneath,
  the short name then the sector: `IND_83_CTR · Falmouth 83`. Without the
  radio name, the sector leads and the short name goes beneath.
- **`airportAt`:** `"right"` puts ` · KLEX` after the radio name, on its
  line and baseline. `"left"` puts it in a narrow column before the rest,
  kept empty for a position without one so a list lines up. `"under"`
  puts the code and the airport's `name` on the second line.
- **An unknown callsign** shows alone, in mono, whatever `show` asks for,
  unless `radioName` or `frequency` is passed: then those show with it.
- With no positions set by the layout, every callsign is unknown.

## Looks

- The leading part: `font-semibold`, `foreground`.
- The frequency: `foreground`, mono (see `Frequency`).
- The second line and the parts after the first in `"inline"`: `text-sm`,
  `muted-foreground`.
- The short name and airport codes: `font-mono`. The code at `"right"`:
  `text-sm`, `muted-foreground`; in the `"left"` column: `text-sm`,
  `foreground-soft`.
- Stacked, it is a block (`flex`) as wide as its container, so the
  frequency sits at the right edge; inline, it flows in a sentence.

## Accessibility

- A `<span>` of text: no role, nothing to focus.
- The `·` separators are `aria-hidden`. A screen reader reads
  "Indy Center, one two eight point two two, IND_83_CTR, Falmouth 83":
  the frequency in its spoken form (see `Frequency`).
