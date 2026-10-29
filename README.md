# design-system

Svelte styled components, SCSS, and CSS tokens to share Indy Center's brand and ui amoung apps.

## Publishing

`publish.yml` runs CI on every push to `main`, then publishes
`@indy-center/centerline-tokens` and then `@indy-center/centerline-svelte`
to npm, each only if npm doesn't have its `package.json` version yet. To
release, bump the version (and the Svelte package's
`@indy-center/centerline-tokens` range, if the tokens changed) and merge.

It uses npm trusted publishing, with no token: each package's settings on
npmjs.com name the `Indy-Center/design-system` repository and the
`publish.yml` workflow, with no environment, and allow `npm publish`.
