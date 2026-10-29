# Indy Centerline

Indy Centerline is Indy Center's design system: the colours, type, chrome
and patterns that make every member app feel like one site. It ships as
two npm packages.

- [`@indy-center/centerline-tokens`](packages/tokens/README.md): the
  brand colours, colour roles and heading font, as CSS custom properties,
  a Tailwind v4 theme, Sass and JSON.

  ```sh
  npm install @indy-center/centerline-tokens
  ```

- [`@indy-center/centerline-svelte`](packages/svelte/README.md): the
  chrome and patterns as Svelte 5 components, styled with the tokens.

  ```sh
  npm install @indy-center/centerline-svelte @indy-center/centerline-tokens
  ```

Every component's doc and live demo is in the component reference, at
[centerline.flyindycenter.com](https://centerline.flyindycenter.com)
(for agents, its `/llms-full.txt`). The rules, such as when to use what,
are in the tech docs' [Design section](https://tech.flyindycenter.com/design/). The
colours and type come from the brand guide, at
[brand.flyindycenter.com](https://brand.flyindycenter.com).

## Publishing

`publish.yml` runs CI on every push to `main`, then publishes
`@indy-center/centerline-tokens` and then `@indy-center/centerline-svelte`
to npm, each only if npm doesn't have its `package.json` version yet. To
release, bump the version (and the Svelte package's
`@indy-center/centerline-tokens` range, if the tokens changed) and merge.

It uses npm trusted publishing, with no token: each package's settings on
npmjs.com name the `Indy-Center/design-system` repository and the
`publish.yml` workflow, with no environment, and allow `npm publish`.

## Licence

MIT (`LICENSE`), except the tokens' font, Source Sans 3: SIL Open Font
License 1.1 (`packages/tokens/fonts/OFL.txt`).
