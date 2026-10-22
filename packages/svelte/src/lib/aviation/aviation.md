---
title: Aviation helpers
description: Plain functions for frequencies, callsigns, positions, ratings, durations and log-out times, so every app follows the same rules.
---

## Checklist

- [ ] Use these instead of your own copies: `(hz / 1000000).toFixed(3)`, a
      position pattern, a suffix list for sorting, a rating table.
- [ ] Pass frequencies in hertz, as vNAS gives them. VATSIM's feed gives
      megahertz (`"128.225"`); `Frequency` takes that as it is.
- [ ] Pass callsigns upper case, as the network writes them. Upper-case
      what a member types before `isPosition`.
- [ ] When the person is online, pass `resolvePosition` the vNAS position
      id (`primaryPositionId` in the vNAS feed), not just the callsign.
- [ ] Sort positions with `comparePositionTypes`, and members by the
      rating's `id`, never by its short code.
- [ ] They format and look up only. None of them fetches; to get the
      positions, use `fetchPositions` from `@indy-center/svelte/server`
      (see the positions lookup's page).

## Use

```ts
import {
  findRating,
  formatDuration,
  formatFrequency,
  logoffFromInfo,
  resolvePosition,
  spokenFrequency,
  type VnasPosition,
} from "@indy-center/svelte";

formatFrequency(128225000); // "128.22"
spokenFrequency(128225000); // "one two eight point two two"

// positions: VnasPosition[], from the app's server load.
resolvePosition("IND_831_CTR", positions);
// { match: "relief", position: { callsign: "IND_83_CTR", … } }

findRating("Controller1")?.long; // "Enroute Controller"
formatDuration(83, "short"); // "1 h 23 m"

// A 2051Z log-in with "Off at 0130Z" in the info: 0130Z the next day.
logoffFromInfo("Off at 0130Z", "2026-10-20T20:51:00Z");
```

## Frequencies

| Function                             | Returns                                                       |
| ------------------------------------ | ------------------------------------------------------------- |
| `formatFrequency(hz, { decimals? })` | Megahertz, two decimals (`"128.22"`), or three (`"128.225"`). |
| `spokenFrequency(hz, { decimals? })` | The words, per FAA JO 7110.65 2-4-17.                         |

`formatFrequency` cuts, never rounds: 128.225 is `"128.22"`. `decimals: 3`
shows the third, which only exists for an 8.33 kHz channel; anything finer
than a whole kHz is cut too, so 128.2299 is `"128.22"`, or `"128.229"`
with three.

`spokenFrequency` says what `formatFrequency` shows, with the same
`decimals`: each digit, "point" for the decimal, and no trailing zeros.
128.225 is "one two eight point two two", or "one two eight point two two
five" with three; 121.500 is "one two one point five", 118.050 is "one one
eight point zero five". Nine is "niner" (2-4-16). The words are lower
case.

With `decimals: 3`, an 8.33 kHz channel, it follows ICAO's rule instead
(Annex 10 Vol II): all six digits, unless the fifth and sixth are both
zero, then the first four. 121.510 is "one two one point five one zero",
118.050 "one one eight point zero five zero", and 121.500 still "one two
one point five".

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

## Grouping who's online by position

`groupByPosition(logins, positions)` takes the feed's logins, each with a
`callsign` and, from the vNAS feed, a `positionId`, and returns one
`{ callsign, position, logins }` per position they resolve to, as
`resolvePosition` resolves them. A relief login (`IND_831_CTR`) joins the
person on `IND_83_CTR`, so `OnlineController` shows the position once with
both names. `callsign` is the position's, or the login's own when it
resolves to nothing; then `position` is undefined, and only logins with
that same callsign share its group. Groups come in the order of their
first login, and the logins in each in the order given.

```ts
groupByPosition(
  [
    { callsign: "IND_83_CTR", name: "Jordan Sample" },
    { callsign: "IND_831_CTR", name: "Alex Example" },
  ],
  positions,
);
// [{ callsign: "IND_83_CTR", position: { … }, logins: [Jordan, Alex] }]
```

## Log-out times

`logoffFromInfo(info, loggedInAt)` is when a controller said they'd log
out, from their controller info: the first `2330z` or `2330Z` in it
(24-hour Zulu, HH 00–23, MM 00–59), as its next occurrence at or after
`loggedInAt`. `info` is the text, or VATSIM's lines of it (`text_atis`);
`loggedInAt` is a `Date`, an ISO string or milliseconds.

| Info, logged in at 2051Z on 20 Oct | Returns         |
| ---------------------------------- | --------------- |
| "Off at 2330z"                     | 2330Z on 20 Oct |
| "Training session until 0130Z"     | 0130Z on 21 Oct |
| "Not 2460Z but 2300Z"              | 2300Z on 20 Oct |
| "Closing at 2460Z"                 | undefined       |
| "Runway 23 in use, ATIS on 128.82" | undefined       |
| "Until 2330", "Ref A2330Z"         | undefined       |

A time that can't be one (`2460Z`) is passed over. Digits without a `Z`,
or inside a longer word or number, aren't read. Once bookings run, a
booking's end wins over this; `OnlineController` does that for you.

## Airports

`AirportInfo` is the type for an airport, `{ code, name? }`: the ICAO code
(`"KLEX"`) and, where the app has it, the name (`"Blue Grass"`).
`Position` takes one as `airport`. vNAS positions carry no airport, so the
app supplies it.

## Ratings

`RATINGS` is VATSIM's controller table, `{ id, short, long }`, from `-1`
INAC to `12` ADM. `findRating(value)` takes any spelling a source gives:
the number (`5`, VATSIM and VATUSA), the short code (`"C1"`), vNAS's name
(`"Controller1"`) or VATSIM's (`"Enroute Controller"`), in any case. It
returns undefined for anything else.

`PILOT_RATINGS` is VATSIM's pilot table, in the same shape, from `0` NEW
to `63` FE; each `id` is a bit mask of the ratings below it (IR is `3`).
`findPilotRating(value)` takes the number, the short code (`"IR"`) or
VATSIM's name (`"Instrument Rating"`), in any case.

To show a rating, use the `Rating` component, which looks it up itself.

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
