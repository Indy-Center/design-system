import type { Severity } from "../severity/severity.js";
import { parseKept, TOAST_COOKIE } from "./kept.js";

/**
 * The part of SvelteKit's `cookies` this uses. Written out, not imported,
 * so it fits Kit 2 and Kit 3 alike.
 */
export type ToastCookies = {
  get(name: string): string | undefined;
  set(
    name: string,
    value: string,
    opts: { path: string; httpOnly: boolean; maxAge: number; sameSite: "lax" },
  ): void;
};

/** How long the cookie lasts, in seconds: long enough to reach the next page. */
const COOKIE_LASTS = 60;

/**
 * Raises a toast from the server, such as in a form action before
 * `redirect()`: `toastFromServer(cookies, "success", "Roster saved.")`.
 * It goes in a short-lived cookie, and `<Toaster>` shows it on the page
 * the browser lands on.
 */
export function toastFromServer(
  cookies: ToastCookies,
  level: Severity,
  message: string,
) {
  const kept = parseKept(cookies.get(TOAST_COOKIE));
  kept.push({ level, message });
  // The browser reads it and deletes it, so it can't be httpOnly. It holds
  // only the messages.
  cookies.set(TOAST_COOKIE, JSON.stringify(kept), {
    path: "/",
    httpOnly: false,
    maxAge: COOKIE_LASTS,
    sameSite: "lax",
  });
}
