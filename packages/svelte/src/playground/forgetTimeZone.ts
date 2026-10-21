import { COOKIE_NAME } from "../lib/timeZone/timeZone.ts";

/**
 * Clears the saved time zone on this host, as if none had been chosen. For
 * the playground and the tests, not the package: a member changes their
 * choice, they don't clear it.
 */
export function forgetTimeZone(): void {
  document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0`;
}
