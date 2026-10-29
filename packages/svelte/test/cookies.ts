// The preference cookies as the tests read them back.
import { commands } from "vitest/browser";
import { COOKIE_NAME as COLOR_SCHEME } from "../src/lib/colorScheme/colorScheme.ts";
import { readPreferenceCookie } from "../src/lib/preferenceCookie/preferenceCookie.ts";
import { readTimeZone } from "../src/lib/timeZone/timeZone.ts";

/** The saved time-zone choice, as the page's next request would carry it. */
export function savedTimeZone() {
  return readTimeZone({ get: readPreferenceCookie });
}

/** The saved colour scheme, as the page's next request would carry it. */
export function savedColorScheme() {
  return readPreferenceCookie(COLOR_SCHEME);
}

/** The cookie `name` as the browser stored it, attributes included. */
export async function storedCookie(name: string) {
  const cookies = await commands.storedCookies();
  return cookies.find((cookie) => cookie.name === name);
}
