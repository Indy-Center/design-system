# @indy-center/tokens

Indy Centerline's brand colours and colour roles, in light and dark, and
its heading font, from the brand guide's Color and type page.

## Use

In a Tailwind v4 app's stylesheet:

```css
@import "tailwindcss";
@import "@indy-center/tokens/tokens.css";
@import "@indy-center/tokens/theme.css";
@import "@indy-center/tokens/fonts.css";
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
- `fonts.css`: Source Sans 3, the heading font, as one variable Latin
  WOFF2 (weights 200 to 900, `font-display: swap`) beside it. The app's
  bundler copies the file.

Tailwind's own colours (`slate-*`, `sky-*`) stay available beside the roles.

### Rich text

`prose.css` adds `prose-centerline`, a theme for
`@tailwindcss/typography` on the roles: `class="prose prose-centerline"`
follows `data-theme`, so it needs no `prose-invert`. Links look like the
`Link` component, inline code is a muted chip, quotes have a sky rule, and
headings take the `Heading` component's sizes. The plugin is the app's own
dependency; import this file after it:

```css
@plugin "@tailwindcss/typography";
@import "@indy-center/tokens/prose.css";
```

Svelte apps use the `Prose` component from `@indy-center/svelte`, which
adds both classes.

### Sass (Payload)

`_tokens.scss` gives each token as its `tokens.css` variable, so load
`tokens.css` as well:

```scss
@use "pkg:@indy-center/tokens/_tokens.scss" as tokens;

.panel {
  background: tokens.token("color.card"); // var(--color-card)
}
```

Name the file in full: `pkg:@indy-center/tokens/tokens` finds `tokens.css`.

### JSON

`tokens.json` holds each scheme's resolved values, for code that can't
read custom properties, such as a canvas:

```js
import tokens from "@indy-center/tokens/tokens.json" with { type: "json" };

tokens.dark.color.card; // "#1E293B"
tokens.light.font.heading; // '"Source Sans 3", ui-sans-serif, …'
```

Each scheme holds the brand colours too.

### The brand guide's tables

`tables.md` holds the guide's Brand colors and Roles tables, generated from
the token files. Since this package shipped, the token files are the source
of truth: after a token change, paste each table between its markers in
`brand-guide/guide/color-and-type.md` and open a PR there.

## Source

The token files in `src/` are in the W3C Design Tokens format (2025.10):
`brand.tokens.json` (Night, Sky, White and the font stacks),
`roles.tokens.json` (the 18 roles, light and dark) and
`tokens.resolver.json` (the light and dark contexts). Terrazzo builds
`dist/` from them: `npm run build`. Its CSS, Tailwind and Sass plugins
write the CSS and SCSS; two small plugins in `scripts/` write
`tokens.json` and `tables.md`. The brand team reviews changes to `src/`
(CODEOWNERS).

`prose.css` is hand-written: every colour in it is a role's variable,
or, for the shadow under `<kbd>`, `foreground` mixed with transparent.

`fonts/` is not generated: Fontsource's file
(`@fontsource-variable/source-sans-3` 5.3.1), unchanged, and `fonts.css`.
To update the font, copy the new
`files/source-sans-3-latin-wght-normal.woff2` and `LICENSE` (as `OFL.txt`)
from that package. Don't cut a subset of our own: "Source" is a Reserved
Font Name under the OFL.

## Licence

MIT (`LICENSE`), except the font: SIL Open Font License 1.1
(`fonts/OFL.txt`).
