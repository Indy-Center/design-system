---
title: Colour scheme
description: The server hook that serves each member's light or dark choice, and the functions that save and clear it.
---

## Checklist

- [ ] Add `colorSchemeHandle` to `src/hooks.server.ts`, with
      `fallback: 'dark'` (phase 1: nobody changes unless they choose).
- [ ] Add the device script's tag to `src/app.html` before
      `%sveltekit.head%`, so it is ready for `fallback: 'device'`.
- [ ] Call `setColorScheme({ fallback })` in the root `+layout.svelte`,
      with the hook's fallback (and `domain`, if not
      `flyindycenter.com`).
- [ ] Let the member choose with `ColorSchemeSetting` (in the user menu
      and on Settings), which saves with `saveColorScheme` and, under
      `fallback: 'device'`, goes back to the device with
      `clearColorScheme`. Never save the device's setting.
- [ ] Wherever you call these yourself, put the note by the control:
      "Saved on this browser for a year, across flyindycenter.com."
- [ ] Don't set `data-theme` on `<html>` yourself. `Header` and `Footer` set
      it on their own root and stay dark in both schemes.

## Use

`src/hooks.server.ts`:

```ts
import { colorSchemeHandle } from "@indy-center/svelte/hooks";

export const handle = colorSchemeHandle({ fallback: "dark" });
```

With other hooks, chain it with `sequence` from SvelteKit's hooks module.

`src/routes/+layout.svelte`, with the same fallback, for
`ColorSchemeSetting`:

```svelte
<script>
  import { setColorScheme } from "@indy-center/svelte";

  let { children } = $props();
  setColorScheme({ fallback: "dark" });
</script>

{@render children()}
```

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
- **`clearColorScheme({ domain })`** is "Use my device's setting": it
  deletes the cookie and applies the device's setting at once (dark when
  the device asks for it, else light). The next page follows the device
  under `fallback: 'device'`; under `fallback: 'dark'` it is dark, so
  `ColorSchemeSetting` offers it only under `'device'`.
- **`setColorScheme({ fallback, domain })`** hands the hook's setup to
  `ColorSchemeSetting` through context. Without it, the control takes
  phase 1's `fallback: 'dark'` on `flyindycenter.com`.
- The member's identity account isn't read or written yet (phase 2).

## Options

| Option                                                             | Type                 | Notes                                                     |
| ------------------------------------------------------------------ | -------------------- | --------------------------------------------------------- |
| `fallback` (hook, `setColorScheme`)                                | `'dark' \| 'device'` | Served when the cookie holds no choice. The same in both. |
| `domain` (`setColorScheme`, `saveColorScheme`, `clearColorScheme`) | `string`             | Defaults to `flyindycenter.com`.                          |

## Accessibility

`ColorSchemeSetting` shows the choice with `aria-pressed`. In the browser,
`document.documentElement.dataset.theme` holds it: `"light"`, `"dark"`, or
nothing for light from the device. It is `"dark"` from the device script
too, so it doesn't say whether the member chose it.
