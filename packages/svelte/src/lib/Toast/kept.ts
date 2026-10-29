import { SEVERITIES, type Severity } from "../severity/severity.js";

/**
 * A toast kept for the next page: in this tab's storage when the page
 * goes, or in the cookie `toastFromServer` writes.
 */
export type KeptToast = { level: Severity; message: string };

/** The cookie `toastFromServer` writes and `<Toaster>` reads, then deletes. */
export const TOAST_COOKIE = "centerline-toasts";

/** The toasts kept in `json`, leaving out anything that isn't one. */
export function parseKept(json: string | null | undefined): KeptToast[] {
  if (!json) return [];
  let kept: unknown;
  try {
    kept = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(kept)) return [];
  return kept.filter(
    (t): t is KeptToast =>
      typeof t?.message === "string" &&
      typeof t?.level === "string" &&
      Object.hasOwn(SEVERITIES, t.level),
  );
}
