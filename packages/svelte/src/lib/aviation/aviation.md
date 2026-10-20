---
title: Aviation helpers
description: Plain functions for frequencies, callsigns, positions, ratings and durations, so every app follows the same rules.
---

## Checklist

- [ ] Use these instead of your own copies: `(hz / 1000000).toFixed(3)`, a
      position pattern, a suffix list for sorting, a rating table.
- [ ] Pass frequencies in hertz, as vNAS gives them. VATSIM's feed already
      gives `"128.225"`; show that as it is.
- [ ] Pass callsigns upper case, as the network writes them. Upper-case
      what a member types before `isPosition`.
- [ ] When the person is online, pass `resolvePosition` the vNAS position
      id (`primaryPositionId` in the vNAS feed), not just the callsign.
- [ ] Sort positions with `comparePositionTypes`, and members by the
      rating's `id`, never by its short code.
- [ ] They format and look up only. None of them fetches; where the
      positions come from is the app's business.

## Use

```ts
import {
  findRating,
  formatDuration,
  formatFrequency,
  resolvePosition,
  spokenFrequency,
  type VnasPosition,
} from "@indy-center/svelte";

formatFrequency(128225000); // "128.225"
spokenFrequency(128225000); // "one two eight point two two"

// positions: VnasPosition[], from the app's server load.
resolvePosition("IND_831_CTR", positions);
// { match: "relief", position: { callsign: "IND_83_CTR", … } }

findRating("Controller1")?.long; // "Enroute Controller"
formatDuration(83, "short"); // "1 h 23 m"
```

## Frequencies

| Function              | Returns                                 |
| --------------------- | --------------------------------------- |
| `formatFrequency(hz)` | Megahertz, three decimals: `"128.225"`. |
| `spokenFrequency(hz)` | The words, per FAA JO 7110.65 2-4-17.   |

`spokenFrequency` says each digit, "point" for the decimal, and drops the
digits after the second decimal: 128.225 is "one two eight point two two",
121.500 is "one two one point five", 118.050 is "one one eight point zero
five". Nine is "niner" (2-4-16). The words are lower case.

## Callsigns and position types

| Function or value            | Returns                                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `parseCallsign(callsign)`    | `{ prefix, middle?, type }`: `IND_83_CTR` is `IND`, `83`, `CTR`. Undefined for a pilot's `AAL123`. |
| `isPosition(callsign)`       | Whether VATUSA takes it as a position (`IND_GND`, `IND_83_CTR`). `RMP` and `TMU` aren't.           |
| `POSITION_TYPES`             | `{ type, name }` from the ground up: DEL, RMP, GND, TWR, APP, DEP, CTR, FSS.                       |
| `comparePositionTypes(a, b)` | For `sort`: callsigns by type, other types and non-callsigns last, ties in the order given.        |

The prefix isn't always the facility: Columbus TRACON has `DAY_M_APP`. A
_position_ on a training record is facility and type only (`IND_GND`); a
_callsign_ is what someone logs on as (`IND_1_GND`).

## Resolving a callsign to a position

`resolvePosition(callsign, positions, { positionId })` returns
`{ match, position }`, or undefined when no position fits. Show an unknown
callsign alone, with no radio name or frequency.

1. **`positionId` given** (`match: "id"`): the position with that vNAS id,
   or none. The callsign isn't read: the person is online and vNAS knows.
2. **Exact** (`"exact"`): the callsign as given.
3. **Relief** (`"relief"`): one trailing digit dropped from the middle part
   (`IND_831_CTR` is `IND_83_CTR`, `IND_E1_APP` is `IND_E_APP`); else an
   all-digit middle dropped (`IND_1_GND` is `IND_GND`).

Checked against all 157 of ZID's positions: none of them, missing from the
list, resolves to another one. A login whose prefix changed (`DCA_J1_APP`
for `PCT_APP`) stays unknown.

`positions` is any array with `id` and `callsign`; `VnasPosition` is the
slim shape the positions lookup supplies:

| Field       | Type      | Notes                                            |
| ----------- | --------- | ------------------------------------------------ |
| `id`        | `string`  | Data Admin's id; the feed's `primaryPositionId`. |
| `callsign`  | `string`  | `IND_83_CTR`.                                    |
| `name`      | `string`  | The sector: "Falmouth 83".                       |
| `radioName` | `string`  | "Indy Center", spaces collapsed.                 |
| `frequency` | `number`  | Hertz.                                           |
| `facility`  | `string`  | The facility's name: "Indianapolis ARTCC".       |
| `starred`   | `boolean` | Starred in Data Admin.                           |

## Ratings

`RATINGS` is VATSIM's controller table, `{ id, short, long }`, from `-1`
INAC to `12` ADM. `findRating(value)` takes any spelling a source gives:
the number (`5`, VATSIM and VATUSA), the short code (`"C1"`), vNAS's name
(`"Controller1"`) or VATSIM's (`"Enroute Controller"`), in any case. It
returns undefined for anything else.

## Durations

`formatDuration(minutes, style)` rounds to the minute and gives the length
whichever way round, so the caller adds "in" or "ago":

| `style`   | 83 minutes             | 0 minutes   |
| --------- | ---------------------- | ----------- |
| `"short"` | "1 h 23 m"             | "0 m"       |
| `"long"`  | "1 hour 23 minutes"    | "0 minutes" |
| `"clock"` | "1:23" (VATUSA's form) | "0:00"      |

## Accessibility

- `spokenFrequency` is for text a person reads or hears, such as a
  procedure's phraseology or screen-reader text beside the digits. Don't put
  it in an `aria-label` on a plain `<span>`: it isn't reliably announced.
- How frequencies, positions and times are shown is the aviation
  components' job (`Position`, `Frequency`, `Time`), not these helpers'.
