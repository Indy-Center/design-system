# Adding a component

Every component is built the same way. `Link` is the worked example: copy
its shape.

## Files

```
src/lib/Name/Name.svelte     the component
src/lib/Name/Name.md         its doc page (ships in the package)
src/lib/Name/Name.test.ts    its tests (left out of the package)
src/lib/index.ts             add: export { default as Name } from "./Name/Name.svelte";
src/routes/name/+page.svelte its playground page (lower-case folder)
```

- The playground's index lists every `src/routes/*/+page.svelte` by
  itself; don't edit it. Wrap the specimen in `<Schemes>` from
  `src/playground/Schemes.svelte`, which shows it in light, in dark and in
  a dark header on a light page.
- `index.ts` is the one shared file: one line each, alphabetical. When
  merging, keep both sides' lines.
- Inside `src/lib`, import with relative paths (`../Link/Link.svelte`).
  SvelteKit 3 has no `$lib`, and `#lib` would not resolve once published.
  Playground pages import from `../../lib/index.ts`.
- A component's own small parts (a helper, an icon) go in its folder. Only
  what `index.ts` exports is public.

## Props

- Svelte 5 runes and TypeScript: `type Props = …; let {…}: Props = $props();`
  with a one-line comment on each prop you add.
- Extend the element's attribute type from `svelte/elements`
  (`HTMLAnchorAttributes`, `HTMLButtonAttributes`) and spread `...rest`
  onto the element, so `aria-*`, `id` and the rest pass through.
- Content is a `children` snippet; extra regions are named snippets, not
  string props holding markup.
- Accept `class` and add it last: `class={[own, className]}`. It is for
  layout (margin, width), not colour. Variants are props (`variant="…"`),
  not classes the caller has to know.

## Colour and type

- Roles only: `bg-card`, `text-foreground-soft`, `border-border`,
  `outline-ring`. No Tailwind stock colours (`slate-800`, `sky-400`) and
  no hex. Roles change with the scheme; stock colours don't.
- Don't write `dark:` for colours: the roles already switch inside any
  `data-theme="dark"` element. `dark:` is for the rare non-colour change.
- Components that are dark in both schemes (Header, Footer) put
  `data-theme="dark"` on their own root, and everything inside follows.
- Never set `data-theme` on `<html>`: the colour-scheme hook does. To save
  a member's choice (UserMenu's colour-scheme item), call
  `saveColorScheme("light" | "dark")` from
  `../colorScheme/saveColorScheme.js` (a `.ts` file, imported as `.js` so
  the built package resolves it); it writes the shared cookie and
  applies the choice at once. Read the scheme in use from
  `document.documentElement.dataset.theme` after mount. See
  `src/lib/colorScheme/colorScheme.md`.
- `font-heading` for headings, `font-mono` for CIDs and ratings; Tailwind's
  default sizes.
- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-ring`.

## Behaviour

- Native elements first: `<a href>` to go somewhere, `<button>` to do
  something, `<details>`, `<dialog>` with `showModal()`, `popover` with CSS
  anchor positioning. No headless library (decision 0003).
- Menus are disclosures: a `<button aria-expanded>` and the list it shows,
  no menu roles. They close on Escape and on a click outside.
- Every control and menu row is at least 44px tall and wide (`min-h-11
min-w-11`). A link inside a sentence is exempt.

## Tests

Test what a user sees, through the component's props, in a real browser:
`renderIn(scheme, Component, props)` from `test/schemes.ts`, then
`vitest/browser` locators and `expect.element`. The page has Tailwind and
the tokens loaded, so computed colours are the real ones.

- Its role and accessible name (`getByRole`).
- Its colours in `light`, `dark` and `dark-header`, compared with the
  brand guide's hex as `rgb(…)` literals. Copy the expected values from the
  guide's Roles table, not from the tokens.
- Keyboard: `userEvent.tab()`, Enter, Escape, as the component needs.
- Snippets for `children` in tests: `createRawSnippet`.

Run one file while working:
`npx vitest run --project components src/lib/Name`.

## Doc page

`Name.md`, which becomes a page in the tech docs:

```md
---
title: Name
description: One sentence: what it is.
---

## Checklist

- [ ] When to use it, and what to use instead.
- [ ] What to write in it.
- [ ] What not to change (colours, sizes).

## Use

A short example importing from "@indy-center/svelte".

## Props

| Prop | Type | Notes |

## Looks

Which roles it uses, in each scheme.

## Accessibility

The element it renders, keyboard behaviour, anything the app must add.
```

The checklist comes first, so an agent using the component can follow it
line by line.

## Before you merge

From the repo root: `npm run format:check`, `npm run check`,
`npm run build`, `npm test`, `npm run pack:dry-run`. Then look at the
playground page at phone width (390px) and wider.
