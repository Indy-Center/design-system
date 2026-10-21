import {
  deletePreferenceCookie,
  type PreferenceCookieOptions,
} from "../preferenceCookie/preferenceCookie.js";
import { COOKIE_NAME } from "./colorScheme.js";
import { colorSchemeChoice } from "./colorSchemeChoice.svelte.js";

/**
 * "Use my device's setting": deletes the saved choice and applies the
 * device's setting at once, dark when it asks for dark, else light. In the
 * browser only. The next page follows the device where the hook has
 * `fallback: 'device'`.
 */
export function clearColorScheme(options: PreferenceCookieOptions = {}): void {
  deletePreferenceCookie(COOKIE_NAME, options);
  const html = document.documentElement;
  if (matchMedia("(prefers-color-scheme: dark)").matches) {
    html.dataset.theme = "dark";
  } else {
    delete html.dataset.theme;
  }
  colorSchemeChoice.current = "device";
}
