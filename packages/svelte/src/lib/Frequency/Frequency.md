---
title: Frequency
description: A radio frequency in mono with two decimals, read out to screen readers the way a controller says it.
---

## Checklist

- [ ] Use `Frequency` for every radio frequency on a page, alone or in a
      table. Inside a `Position` it is already there: ask for it with
      `show`, don't add another.
- [ ] Give it a `callsign` and let it look itself up from the page's
      positions (see the positions lookup), or a `value`: hertz as vNAS
      gives it (`128225000`), or megahertz as written (`"128.225"`).
- [ ] Leave `decimals` at 2. `decimals={3}` is a dormant flag for
      8.33 kHz spacing, which the US doesn't use.
- [ ] Don't add "MHz" or a copy button beside it, and don't print the
      spoken form: screen readers already get it.
- [ ] It sets no colour of its own: it takes the colour of the text it
      sits in. `class` is for layout, such as a margin.

## Use

```svelte
<script>
  import { Frequency } from "@indy-center/svelte";
</script>

<!-- 128.22, from the page's positions -->
<Frequency callsign="IND_83_CTR" />

<!-- 121.90 -->
<Frequency value={121900000} />
<Frequency value="121.9" />

<!-- 128.225 -->
<Frequency value={128225000} decimals={3} />
```

## Props

| Prop       | Type               | Notes                                                                                                          |
| ---------- | ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `value`    | `number \| string` | Hertz (`128225000`), or megahertz as written (`"128.225"`). Wins over `callsign`.                              |
| `callsign` | `string`           | Looks the frequency up from the page's positions, relief logins included (`IND_831_CTR` gives `IND_83_CTR`'s). |
| `decimals` | `2 \| 3`           | `2` by default: `121.90`, and `128.225` as `128.22`, the third cut, not rounded. `3` shows the third.          |
| `class`    | `string`           | Layout only.                                                                                                   |
| others     | global attributes  | `id`, `aria-*` and the rest, on its `<span>`.                                                                  |

With neither, an unknown callsign or a `value` that isn't a frequency, it
shows nothing.

## Looks

- `font-mono` with `tabular-nums`, so a column of frequencies lines up.
- Always two decimals, even when the second is zero (`121.90`). The third
  is cut, as a controller says it: `128.225` is `128.22`.
- No colour of its own; in a `Position` it is `foreground`.

## Accessibility

- A `<span>`: the digits are `aria-hidden`, and a visually hidden span
  beside them holds the spoken form per FAA JO 7110.65 2-4-17, so a
  screen reader says "one two eight point two two" rather than "one
  hundred twenty-eight point two two". The third decimal is never
  spoken, even with `decimals={3}`.
- Copying the text selects the digits, not the spoken form.
