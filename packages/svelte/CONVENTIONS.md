# Adding a component

Every component is built the same way. `Link` is the worked example: copy
its shape.

## Files

```
src/lib/Name/Name.svelte     the component
src/lib/Name/Name.md         its doc page (ships in the package)
src/lib/Name/Name.test.ts    its tests (left out of the package)
src/lib/Name/Name.test.svelte a wrapper its tests render, if they need one
src/lib/index.ts             add: export { default as Name } from "./Name/Name.svelte";
src/routes/name/+page.svelte its playground page (lower-case folder)
```

- The playground's index lists every `src/routes/*/+page.svelte` by
  itself; don't edit it. Wrap the specimen in `<Schemes>` from
  `src/playground/Schemes.svelte`, which shows it in light, in dark and in
  a dark header on a light page. A full-width band (`Footer`, `PageHero`)
  is squashed by its narrow columns, so its page shows it full width on a
  light page and on a dark one instead. A header part (`AppsMenu`, `AppNav`), dark in both schemes and
  with no background of its own, skips `<Schemes>` too: its page shows it
  in a dark header band on a light page and on a dark one.
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
- Two exported components that draw the same thing for different jobs
  (`StarRating` to choose, `StarDisplay` to show) share one folder, doc
  page and playground page, named for the first. Their shared look goes
  in a module in that folder (`stars.ts`), and the doc page gives each a
  Props table.
- Parts that several components share, and that aren't exported, get a
  folder of their own with no doc page: `formControl` (the controls'
  classes), `buttonClasses` (Button's variants, which DropdownMenu's arrow
  shares), `CloseButton` (Alert's and Toast's close button), `IconTile`
  (the tinted icon tile of ErrorPage, EmptyState and StatCard),
  `AbbrTooltip` (a code in an `<abbr>` with its long name hidden for
  screen readers and in a Tooltip, for Rating, Credential, FlightCategory
  and Airport),
  `headerMenu` (the header's disclosure button and panel, its link
  classes, and the trailing-slash rule for the current page, for
  AppsMenu, AppNav, AppNavMenu and UserMenu), `preferenceControl` (the
  settings' rows and "What's saved?" note), `preferenceCookie` (the
  preference cookies' attributes).
- Something an app raises with a function, rather than places, is named
  for what the member sees: `Toast/` holds `toast.svelte.ts` (the
  function and its state), `Toaster.svelte` (the one component that shows
  them), `Toast.md` and `Toast.test.ts`, and the playground is
  `routes/toast`.
- A component that is both placed and raised with a function keeps the
  function in the component's folder: `ConfirmDialog/` holds
  `ConfirmDialog.svelte`, `confirmAction.ts` and the private
  `ConfirmPrompt.svelte` it mounts, with one doc page and playground for
  both.

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
  solid fills that suit both schemes. Test every variant against the
  guide's steps (`styleOfClasses` in `test/contrast.ts`); the steps are
  chosen for 4.5:1, so the guide holds the contrast. Anything new reaches
  for a role first.
- Components that are dark in both schemes (Header, Footer) put
  `data-theme="dark"` on their own root, and everything inside follows.
- Never set `data-theme` on `<html>`: the colour-scheme hook does. To let
  a member choose (UserMenu's colour-scheme item), place
  `ColorSchemeSetting` from `../ColorSchemeSetting/ColorSchemeSetting.svelte`;
  it calls `saveColorScheme` and `clearColorScheme` from
  `../colorScheme/` (`.ts` files, imported as `.js` so the built package
  resolves them), which write or delete the shared cookie and apply the
  choice at once. It takes the hook's fallback and the cookie's domain
  from the app's `setColorScheme`, never props. The time zone's choice
  is `TimeZoneSetting`, the same way (from `setTimeZone`). Read the scheme in use from
  `document.documentElement.dataset.theme` after mount. See
  `src/lib/colorScheme/colorScheme.md`.
- `font-heading` for headings, `font-mono` for CIDs, controller ratings
  (`S3`, `C1`; not star ratings) and HTTP status codes (ErrorPage's
  `404`); Tailwind's default sizes.
- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-ring`. Where a parent's `overflow-hidden` (or a
  scrolling list) would clip that ring, inset it instead with
  `focus-visible:-outline-offset-2`: a menu's rows (`DropdownMenuItem`)
  and `Tabs`.

## Behaviour

- Native elements first: `<a href>` to go somewhere, `<button>` to do
  something, `<details>`, `<dialog>` with `showModal()`, `popover` with CSS
  anchor positioning. No headless library (decision 0003).
- Menus are disclosures: a `<button aria-expanded>` and the list it shows,
  no menu roles. They close on Escape and on a click or tap outside.
- For that closing, put the `dismiss` action from `../dismiss/dismiss.js`
  on the panel: `use:dismiss={{ open, trigger, onclose }}`, with the
  trigger from `bind:this` on a `$state`. While open, it closes on Escape
  (focus goes back to the trigger) and on a tap outside the panel and
  trigger; a press that moves (a scroll or a drag) leaves it open. With
  panels open inside each other, one Escape closes only the innermost
  where focus is (a tooltip in an open menu, then the menu). It is for
  menus, `Tooltip` and `Combobox`; it isn't exported.
  Its tests, `src/lib/dismiss/dismiss.test.ts`, show it in use.
- A panel drawn above the page (so a table or a scrolling box can't clip
  it) is a `popover="manual"` element with the `popover` action from
  `../popover/popover.js`: `use:popover={{ open, anchor, area, fallbacks }}`.
  It shows and hides the panel as `open` changes and places it against
  `anchor` with CSS anchor positioning, `area` and `fallbacks` being
  `position-area` and `position-try-fallbacks` (`"top"`, `"flip-block"`).
  Pair it with `dismiss`. `DropdownMenu` and `Tooltip` use it; it isn't
  exported.
- Every control and menu row is at least 44px tall and wide (`min-h-11
min-w-11`). A link inside a sentence is exempt.

## Tests

Test what a user sees, through the component's props, in a real browser:
`renderIn(scheme, Component, props)` from `test/schemes.ts`, then
`vitest/browser` locators and `expect.element`. The page has Tailwind and
the tokens loaded, so computed colours are the real ones.

- Its role and accessible name (`getByRole`).
- Its colours in `light`, from `role()` in `test/roles.ts`:
  `toHaveStyle({ color: role("link", "light") })`. Test `dark` too only
  where the component has code for it: a `dark:` class, a `data-theme` of
  its own, or a choice made for dark (`test.each(["light", "dark"] as const)`).
  A component that is dark in both schemes is tested once, on a light
  page, against the dark roles. The dark header isn't tested in
  components: the tokens' tests prove the roles follow `data-theme`.
  `role()` reads the tokens' `tokens.json`, so a palette change needs no
  test edits; the tokens package holds those values to the guide. Don't
  type a role's `rgb(…)`. Name the role the component's class uses, not
  one that happens to share its value. A see-through role is
  `translucent(role(…), percent)` from `test/contrast.ts`, so the hue is
  checked as well as the opacity. A colour that isn't a role
  (`transparent`, one the test sets itself, a stock step) stays a literal
  with a comment.
- A pseudo-element's colour (`::placeholder`, `::marker`, `::backdrop`)
  stays on `getComputedStyle(el, "::…")`, since `toHaveStyle` can't read
  one.
- A part's looks are tested in the part, not in each component that uses
  it. A shared part (`formControl`, `AbbrTooltip`, `headerMenu`) has its
  own test file; a component that uses it keeps one test that it is wired
  in.
- Keyboard: `userEvent.tab()`, Enter, Escape, as the component needs.
- Test our code, not the browser's or Svelte's: not a native radio's
  arrow keys or a `<details>` opening, not `$props.id()` being unique.
  Find elements by role rather than `tagName` or `parentElement`. Keep one
  test that `class` and `...rest` land where the Props table says.
- Logic with no DOM (a module's pure function: `stars.ts`, `format.ts`)
  gets a plain table test, `test.each`, in `name.node.test.ts` beside it,
  which runs in Node. The component keeps one render of each case it
  draws differently.
- Snippets for `children` and `icon`: `text("…")` and `icon` from
  `test/snippets.ts`, or your own with `createRawSnippet`. That needs one
  root element, so for children that are loose HTML (Prose's `{@html}`
  body), several siblings or other components (a table's `Th` and
  `Link`, a list's rows), write a small wrapper component beside the
  test, as `Name.test.svelte` (`Prose/Prose.test.svelte`); the package
  leaves it out with the tests. `test/` holds only what several test
  files share, such as `test/WithPositions.svelte`.

Run one file while working:
`npx vitest run --project components src/lib/Name`, or
`--project node` for a `.node.test.ts`.

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

A short example importing from "@indy-center/centerline-svelte".

## Props

| Prop | Type | Notes |

## What it shows (optional)

What the member sees in each state, when the props alone don't say it:
an empty value, a value that crosses midnight, a value it can't read.

## Server and browser (optional)

What the server draws and what changes once the page loads, when they
differ: anything that needs the member's zone or device.

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

On a machine shared with other agents, run the tests and checks under
one shared lock, so only one runs at a time:
`flock /tmp/centerline-vitest.lock npm test` (and the same for
`npm run check` or one file's `npx vitest run`). Two at once share the
cores and time each other out.
