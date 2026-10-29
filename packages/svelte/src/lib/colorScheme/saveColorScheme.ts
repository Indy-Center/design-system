import {
  writePreferenceCookie,
  type PreferenceCookieOptions,
} from "../preferenceCookie/preferenceCookie.js";
import { COOKIE_NAME, type ColorScheme } from "./colorScheme.js";
import { colorSchemeChoice } from "./colorSchemeChoice.svelte.js";

export type SaveColorSchemeOptions = PreferenceCookieOptions;

/**
 * Saves the member's explicit choice to the shared cookie and applies it to
 * the page at once. In the browser only; for the colour-scheme control.
 * Never call it with the device's setting: `clearColorScheme` goes back
 * to that.
 */
export function saveColorScheme(
  scheme: ColorScheme,
  options: SaveColorSchemeOptions = {},
): void {
  writePreferenceCookie(COOKIE_NAME, scheme, options);
  document.documentElement.dataset.theme = scheme;
  colorSchemeChoice.current = scheme;
}
