# Indy Centerline for Svelte

`@indy-center/centerline-svelte`: Indy Centerline's chrome and patterns as
Svelte 5 components, styled with Tailwind v4 and the roles from
`@indy-center/centerline-tokens`. Install it beside its peers:

```sh
npm install @indy-center/centerline-svelte @indy-center/centerline-tokens
```

The app needs `svelte` 5 and `tailwindcss` 4 already.

## Use

In the app's stylesheet, import the tokens and add one `@source` line, so
Tailwind writes the classes the components use (it skips `node_modules`
unless told). The path is relative to the stylesheet; this one is for
`src/app.css` (an app from `npx sv create` keeps it in
`src/routes/layout.css`, so there it is `../../node_modules/…`):

```css
@import "tailwindcss";
@import "@indy-center/centerline-tokens/tokens.css";
@import "@indy-center/centerline-tokens/theme.css";
@import "@indy-center/centerline-tokens/base.css";
@import "@indy-center/centerline-tokens/fonts.css";
@source "../node_modules/@indy-center/centerline-svelte";
```

`base.css` gives the page its background and text colours; without it the
page behind the components keeps the browser's own.

Then:

```svelte
<script>
  import { Link } from "@indy-center/centerline-svelte";
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
import { colorSchemeHandle } from "@indy-center/centerline-svelte/hooks";

export const handle = colorSchemeHandle({ fallback: "dark" });
```

The root layout hands the same fallback to the colour-scheme control:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { setColorScheme } from "@indy-center/centerline-svelte";

  let { children } = $props();
  setColorScheme({ fallback: "dark" });
</script>

{@render children()}
```

See [`src/lib/colorScheme/colorScheme.md`](src/lib/colorScheme/colorScheme.md)
for the `app.html` script tag and saving a choice.

`Prose`, for CMS rich text, also needs `@tailwindcss/typography` and
`@indy-center/centerline-tokens/prose.css` in the stylesheet: see
[`src/lib/Prose/Prose.md`](src/lib/Prose/Prose.md).

Aviation helpers (frequencies, callsigns, positions, ratings, durations)
are plain functions from the package root, for an app's own code too:
see [`src/lib/aviation/aviation.md`](src/lib/aviation/aviation.md).

`Position` and `Frequency` look callsigns up in the page's positions. The
root layout's server `load` fetches them from vNAS with
`@indy-center/centerline-svelte/server`, and the layout sets them once: see
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

## Playground deploy

The playground runs as the `centerline` Worker at
[centerline.flyindycenter.com](https://centerline.flyindycenter.com), a
Custom Domain set in `wrangler.jsonc`. `build-and-deploy.yml` runs CI,
then deploys on every push to `main`. It
needs one repository secret, `CLOUDFLARE_WORKERS_API_KEY`: a Cloudflare
API token with Workers Scripts:Edit. The playground has no bindings or
runtime secrets.

- `npm run build:playground`: builds the tokens, then the playground as a
  Worker, into `.svelte-kit/cloudflare`.
- `npm run preview:playground`: builds it and serves it on the local
  Workers runtime.
- `npm run deploy`: builds and deploys it by hand (after
  `npx wrangler login`).
