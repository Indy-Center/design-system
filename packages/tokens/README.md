# @indy-center/tokens

Indy Centerline's brand colours and colour roles, in light and dark, from
the brand guide's Color and type page.

## Use

In a Tailwind v4 app's stylesheet:

```css
@import "tailwindcss";
@import "@indy-center/tokens/tokens.css";
@import "@indy-center/tokens/theme.css";
```

- `tokens.css`: every brand colour, role and font stack as a CSS custom
  property, with Tailwind's names (`--color-card`, `--font-heading`). Light
  on `:root`; dark on any element with `data-theme="dark"`, whether that is
  `<html>` or a header on a light page. Apps without Tailwind import this
  file alone.
- `theme.css`: the same names in Tailwind's `@theme`, so `bg-card`,
  `text-foreground`, `font-heading` and the rest exist; a `dark:` variant
  that applies on and inside `data-theme="dark"`; and tabular numbers on
  `font-mono`.

Tailwind's own colours (`slate-*`, `sky-*`) stay available beside the roles.

## Source

The token files in `src/` are in the W3C Design Tokens format (2025.10):
`brand.tokens.json` (Night, Sky, White and the font stacks),
`roles.tokens.json` (the 18 roles, light and dark) and
`tokens.resolver.json` (the light and dark contexts). Terrazzo builds
`dist/` from them: `npm run build`.
