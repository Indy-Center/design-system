---
title: Colour scheme
description: The server hook that serves each member's light or dark choice, and the function that saves it.
---

## Checklist

- [ ] Add `colorSchemeHandle` to `src/hooks.server.ts`, with
      `fallback: 'dark'` (phase 1: nobody changes unless they choose).
- [ ] Add the device script's tag to `src/app.html` before
      `%sveltekit.head%`, so it is ready for `fallback: 'device'`.
- [ ] Save a choice only from the user menu's colour-scheme item, with
      `saveColorScheme`. Never save the device's setting.
- [ ] Don't set `data-theme` on `<html>` yourself. `Header` and `Footer` set
      it on their own root and stay dark in both schemes.

## Use

`src/hooks.server.ts`:

```ts
import { colorSchemeHandle } from "@indy-center/svelte/hooks";

export const handle = colorSchemeHandle({ fallback: "dark" });
```

With other hooks, chain it with `sequence` from SvelteKit's hooks module.

`src/app.html`, in `<head>`:

```html
<script nonce="%sveltekit.nonce%">
  /* @indy-center/svelte color scheme */
</script>
```

In a component, when the member picks light or dark:

```svelte
<script>
  import { saveColorScheme } from "@indy-center/svelte";
</script>

<button type="button" onclick={() => saveColorScheme("light")}>Light</button>
```

## What it does

- **On the server**, the hook reads the `indy-color-scheme` cookie, shared
  across `flyindycenter.com`, and writes `data-theme="light"` or `"dark"` on
  `<html>` as the page renders, so there is no flash.
- **No cookie**: `fallback: 'dark'` writes dark. `fallback: 'device'` writes
  nothing, and the script in `<head>` sets dark when the device asks for it;
  otherwise the page is light.
- **The script tag**: the hook fills in the comment. It carries
  `%sveltekit.nonce%`, so it runs under a Content Security Policy in nonce
  mode. Without the tag, the hook adds a script of its own at the start of
  `<head>`, without a nonce, which a Content Security Policy blocks; in dev
  it logs a warning saying to add the tag. Prerendered pages get no cookie
  and no nonce.
- **`saveColorScheme(scheme, { domain })`** writes the cookie for a year on
  `Path=/` and sets `data-theme` on `<html>` at once. `domain` defaults to
  `flyindycenter.com`; on a page outside it (localhost, a preview host), the
  cookie is kept for that host alone. It runs in the browser only.
- The member's identity account isn't read or written yet (phase 2).

## Options

| Option                       | Type                 | Notes                                   |
| ---------------------------- | -------------------- | --------------------------------------- |
| `fallback` (hook)            | `'dark' \| 'device'` | Served when the cookie holds no choice. |
| `domain` (`saveColorScheme`) | `string`             | Defaults to `flyindycenter.com`.        |

## Accessibility

Show the scheme in use in the user menu's item (for example with
`aria-pressed` on Light and Dark). In the browser,
`document.documentElement.dataset.theme` holds it: `"light"`, `"dark"`, or
nothing for light from the device. It is `"dark"` from the device script
too, so it doesn't say whether the member chose it.
