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
- Anything a playground page and the tests both use (sample content, a
  helper) goes in `src/playground/`, as `lesson.ts` and
  `forgetColorScheme.ts` do.
- A component's own small parts (a helper, an icon) go in its folder. Only
  what `index.ts` exports is public.
- A part that callers use but only inside the component (Table's `Th`)
  goes in the component's folder too, exported from `index.ts`. It has
  no folder, doc page or playground page of its own: the component's doc
  page gives it a Props table, and the component's tests and playground
  cover it.
- Parts that several components share, and that aren't exported, get a
  folder of their own with no doc page: `formControl` (the controls'
  classes), `CloseButton` (Alert's and Toast's close button).
- Something an app raises with a function, rather than places, is named
  for what the member sees: `Toast/` holds `toast.svelte.ts` (the
  function and its state), `Toaster.svelte` (the one component that shows
  them), `Toast.md` and `Toast.test.ts`, and the playground is
  `routes/toast`.

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
- When the component wraps its element in a box of its own (Table's
  scroll region around its `<table>`), `class` goes on the outer box,
  since it is for layout, and `...rest` on the element. Say so in the
  doc page's Props table, and test both.
- The exception: a component the page has once and places itself, such as
  `Toaster`, takes no props. Its doc page says so under `## Props`.

## Colour and type

- Roles only: `bg-card`, `text-foreground-soft`, `border-border`,
  `outline-ring`. No Tailwind stock colours (`slate-800`, `sky-400`) and
  no hex. Roles change with the scheme; stock colours don't.
- Don't write `dark:` for colours: the roles already switch inside any
  `data-theme="dark"` element. `dark:` is for the rare non-colour change.
- The exception: a hue the roles don't have. The theme keeps Tailwind's
  stock colours, so use them there: `Badge` takes the guide's
  status-badge steps, with `dark:` for the dark pair, and `Chip` takes
  solid fills that suit both schemes. Test them against the steps
  (`styleOfClasses` in `test/contrast.ts`) and for 4.5:1
  (`expectReadable`). Anything new reaches for a role first.
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
- For that closing, put the `dismiss` action from `../dismiss/dismiss.js`
  on the panel: `use:dismiss={{ open, trigger, onclose }}`, with the
  trigger from `bind:this` on a `$state`. While open, it closes on Escape
  (focus goes back to the trigger) and on a press outside the panel and
  trigger. It is for menus, `Tooltip` and `Combobox`; it isn't exported.
  Its tests, `src/lib/dismiss/dismiss.test.ts`, show it in use.
- Every control and menu row is at least 44px tall and wide (`min-h-11
min-w-11`). A link inside a sentence is exempt.

## Tests

Test what a user sees, through the component's props, in a real browser:
`renderIn(scheme, Component, props)` from `test/schemes.ts`, then
`vitest/browser` locators and `expect.element`. The page has Tailwind and
the tokens loaded, so computed colours are the real ones.

- Its role and accessible name (`getByRole`).
- Its colours in `light`, `dark` and `dark-header`, from `role()` in
  `test/roles.ts`: `test.each(SCHEMES)` (from `test/contrast.ts`), then
  `toHaveStyle({ color: role("link", scheme) })`.
  It reads the tokens' `tokens.json`, so a palette change needs no test
  edits; the tokens package holds those values to the guide. Don't type a
  role's `rgb(…)`. Name the role the component's class uses, not one that
  happens to share its value. A colour that isn't a role (`transparent`,
  one the test sets itself, a stock step) stays a literal with a comment.
- Keyboard: `userEvent.tab()`, Enter, Escape, as the component needs.
- Snippets for `children` and `icon`: `text("…")` and `icon` from
  `test/snippets.ts`, or your own with `createRawSnippet`. That needs one
  root element, so for children that are loose HTML (Prose's `{@html}`
  body), several siblings or other components (a table's `Th` and
  `Link`, a list's rows), write a small wrapper component in `test/`
  instead, as `test/ProseLesson.svelte` and `test/ControllerTable.svelte`
  do.

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
