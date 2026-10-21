import { getContext, setContext } from "svelte";
import type { PreferenceCookieOptions } from "../preferenceCookie/preferenceCookie.js";
import type { ColorSchemeHandleOptions } from "./colorSchemeHandle.js";

export type SetColorSchemeOptions = PreferenceCookieOptions &
  ColorSchemeHandleOptions;

const key = Symbol("@indy-center/svelte colour scheme");

/**
 * Tells the colour-scheme controls below this one how the app's hook is set
 * up: its `fallback`, so "Use my device's setting" shows only where the
 * next page would follow the device, and the cookie's `domain`. Call it
 * once, in the root layout, with the hook's fallback:
 * `setColorScheme({ fallback: "dark" })`.
 */
export function setColorScheme(options: SetColorSchemeOptions): void {
  setContext(key, options);
}

/**
 * The setup the root layout gave `setColorScheme`. Without one, phase 1's:
 * `fallback: 'dark'`, on flyindycenter.com.
 */
export function getColorScheme(): SetColorSchemeOptions {
  return (
    getContext<SetColorSchemeOptions | undefined>(key) ?? { fallback: "dark" }
  );
}
