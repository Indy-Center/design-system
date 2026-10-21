# @indy-center/svelte

Indy Centerline's chrome and patterns as Svelte 5 components, styled with
Tailwind v4 and the roles from `@indy-center/tokens`.

## Use

Install it beside its peers:

```sh
npm install @indy-center/svelte @indy-center/tokens
```

The app needs `svelte` 5 and `tailwindcss` 4 already.

In the app's stylesheet, import the tokens and add one `@source` line, so
Tailwind writes the classes the components use (it skips `node_modules`
unless told). The path is relative to the stylesheet; this one is for
`src/app.css`:

```css
@import "tailwindcss";
@import "@indy-center/tokens/tokens.css";
@import "@indy-center/tokens/theme.css";
@import "@indy-center/tokens/fonts.css";
@source "../node_modules/@indy-center/svelte";
```

Then:

```svelte
<script>
  import { Link } from "@indy-center/svelte";
</script>

<Link href="/events">Event schedule</Link>
```

Components take the light or dark colours from the nearest
`data-theme="dark"` element, so they work on a dark page and in the dark
header on a light page alike.

The page's colour scheme comes from a server hook, which serves each
member's choice from a cookie shared across the Indy Center sites:

```ts
// src/hooks.server.ts
import { colorSchemeHandle } from "@indy-center/svelte/hooks";

export const handle = colorSchemeHandle({ fallback: "dark" });
```

The root layout hands the same fallback to the colour-scheme control:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { setColorScheme } from "@indy-center/svelte";

  let { children } = $props();
  setColorScheme({ fallback: "dark" });
</script>

{@render children()}
```

See [`src/lib/colorScheme/colorScheme.md`](src/lib/colorScheme/colorScheme.md)
for the `app.html` script tag and saving a choice.

`Prose`, for CMS rich text, also needs `@tailwindcss/typography` and
`@indy-center/tokens/prose.css` in the stylesheet: see
[`src/lib/Prose/Prose.md`](src/lib/Prose/Prose.md).

Aviation helpers (frequencies, callsigns, positions, ratings, durations)
are plain functions from the package root, for an app's own code too:
see [`src/lib/aviation/aviation.md`](src/lib/aviation/aviation.md).

`Position` and `Frequency` look callsigns up in the page's positions. The
root layout's server `load` fetches them from vNAS with
`@indy-center/svelte/server`, and the layout sets them once: see
[`src/lib/positions/positions.md`](src/lib/positions/positions.md).

## Docs

Each component's doc page ships beside it, as
`dist/<Component>/<Component>.md`, with Starlight front matter (`title`,
`description`).

## Developing

- `npm run dev`: the playground, which shows each component in light, in
  dark and in a dark header on a light page.
- `npm test`: builds the tokens and this package, then runs each
  component's tests (and `test/*.browser.test.ts`) in headless
  Chromium, and the pure modules' tests
  (`*.node.test.ts`) and the packed files' checks in Node. Where
  Playwright's own Chromium isn't installed, point `CHROMIUM_PATH` at
  another Chromium build.
- `npm run check`, `npm run build`.

Adding a component: follow [`CONVENTIONS.md`](CONVENTIONS.md).
