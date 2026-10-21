import { readPreferenceCookie } from "../preferenceCookie/preferenceCookie.js";
import {
  COOKIE_NAME,
  parseColorScheme,
  type ColorScheme,
} from "./colorScheme.js";

/**
 * The member's choice in the browser, shared by every colour-scheme control
 * on the page: undefined until one reads it after mount. Only the browser
 * writes it, so on the server it stays undefined.
 */
export const colorSchemeChoice = $state<{
  current: ColorScheme | "device" | undefined;
}>({ current: undefined });

/** Reads the choice from the cookie, once the page is in the browser. */
export function readColorSchemeChoice(): void {
  colorSchemeChoice.current =
    parseColorScheme(readPreferenceCookie(COOKIE_NAME)) ?? "device";
}
