---
title: Severity scale
description: The four levels Alert and Toast share, each with a colour role, an icon and a spoken label.
---

## Checklist

- [ ] Pick a level by what it means: the colour follows.
- [ ] Use `SEVERITIES` when an app draws its own severity mark, so its
      icon, label and role match Alert and Toast.
- [ ] Keep `text-warning` off `bg-background`: in the light scheme it is
      4.49:1 there, just short of 4.5. It passes on `bg-card`.

## Use

```ts
import { SEVERITIES, type Severity } from "@indy-center/svelte";

const level: Severity = "caution";
SEVERITIES[level].label; // "Caution"
```

## The levels

Least to most important; a more important toast takes a less important
one's place.

| Level     | Means                           | Role          | Spoken label | Icon (MDI)            |
| --------- | ------------------------------- | ------------- | ------------ | --------------------- |
| `info`    | Good to know                    | `info`        | Info         | information-outline   |
| `success` | It worked                       | `success`     | Success      | check-circle-outline  |
| `caution` | Could cause a problem           | `warning`     | Caution      | alert-outline         |
| `danger`  | Will cause a problem, or failed | `destructive` | Danger       | alert-octagon-outline |

Each entry also holds the classes Alert and Toast use: `text`, `tint`
(Alert's wash and border) and `rule` (Toast's left edge).
