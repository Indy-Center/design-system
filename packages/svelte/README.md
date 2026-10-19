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

## Docs

Each component's doc page ships beside it, as
`dist/<Component>/<Component>.md`, with Starlight front matter (`title`,
`description`).

## Developing

- `npm run dev`: the playground, which shows each component in light, in
  dark and in a dark header on a light page.
- `npm test`: builds the tokens and this package, then runs each
  component's tests in headless Chromium and checks the packed files. Where
  Playwright's own Chromium isn't installed, point `CHROMIUM_PATH` at
  another Chromium build.
- `npm run check`, `npm run build`.

Adding a component: follow [`CONVENTIONS.md`](CONVENTIONS.md).
