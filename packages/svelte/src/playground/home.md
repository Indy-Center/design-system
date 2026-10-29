---
title: Indy Centerline
description: Indy Center's design system, the colours, type, chrome and patterns that make every member app feel like one site, and the reference for its components.
---

Indy Centerline is Indy Center's design system: the colours, type, chrome
and patterns that make every member app feel like one site. This site is
its component reference: each component's doc above a live demo, in light
and in dark.

## Install

It ships as two npm packages.

- [`@indy-center/centerline-tokens`](../../../tokens/README.md): the
  brand colours, colour roles and heading font, as CSS custom properties,
  a Tailwind v4 theme, Sass and JSON.

  ```sh
  npm install @indy-center/centerline-tokens
  ```

- [`@indy-center/centerline-svelte`](../../README.md): the chrome and
  patterns as Svelte 5 components, styled with the tokens.

  ```sh
  npm install @indy-center/centerline-svelte @indy-center/centerline-tokens
  ```

Each package's README, linked above, sets up the app's stylesheet and
hooks.

## Elsewhere

- The rules, such as when to use which component, are in the tech docs'
  [Design section](https://tech.flyindycenter.com/design/).
- The colours and type come from the
  [brand guide](https://brand.flyindycenter.com).
- The code is in
  [Indy-Center/design-system](https://github.com/Indy-Center/design-system).
