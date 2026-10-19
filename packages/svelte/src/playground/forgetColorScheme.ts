import { COOKIE_NAME } from "../lib/colorScheme/colorScheme.ts";

/**
 * Clears the saved choice on this host, as if none had been made. For the
 * playground and the tests, not the package: an app's member changes their
 * choice, they don't clear it.
 */
export function forgetColorScheme(): void {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`;
}
