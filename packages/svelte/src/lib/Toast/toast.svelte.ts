import { BROWSER } from "esm-env";
import { SEVERITIES, type Severity } from "../severity/severity.js";
import { parseKept, TOAST_COOKIE, type KeptToast } from "./kept.js";

/** How long a toast shows, in milliseconds, while nothing is on it. */
export const TOAST_DURATION = 5000;
const MOST_SHOWN = 3;
const STORAGE_KEY = "centerline-toasts";
// How long a line stays in a live region, in milliseconds: long enough to
// be read, then cleared so the region doesn't grow.
const READ_LINE_FOR = 7000;
const rank = (level: Severity) => SEVERITIES[level].rank;

export type ShownToast = {
  id: number;
  level: Severity;
  message: string;
  /** Milliseconds left on its clock. */
  left: number;
  /** Whether a live region has read it: once, when it first shows. */
  announced: boolean;
};

/**
 * The page's toasts: up to three shown, newest first, the rest queued.
 * One for the whole page; `<Toaster>` shows it.
 */
class Toasts {
  shown = $state<ShownToast[]>([]);
  queued: ShownToast[] = [];
  /** What the live regions read: `status` politely, `alert` at once. */
  lines = $state<Record<"status" | "alert", string[]>>({
    status: [],
    alert: [],
  });
  #nextId = 1;

  raise(level: Severity, message: string) {
    const added: ShownToast = {
      id: this.#nextId++,
      level,
      message,
      left: TOAST_DURATION,
      announced: false,
    };
    if (this.shown.length < MOST_SHOWN) {
      this.#show(added);
      return;
    }
    // The least important showing, the oldest among equals (newest first,
    // so the last one found).
    let least = this.shown[0]!;
    for (const t of this.shown)
      if (rank(t.level) <= rank(least.level)) least = t;
    if (rank(level) > rank(least.level)) {
      this.shown = this.shown.filter((t) => t !== least);
      this.queued.unshift({ ...least });
      this.#show(added);
    } else {
      this.queued.push(added);
    }
  }

  close(id: number) {
    this.shown = this.shown.filter((t) => t.id !== id);
    this.#promote();
  }

  /** Runs every shown toast's clock on by `ms`. */
  tick(ms: number) {
    for (const t of this.shown) t.left -= ms;
    const done = this.shown.filter((t) => t.left <= 0);
    if (!done.length) return;
    this.shown = this.shown.filter((t) => t.left > 0);
    this.#promote();
  }

  /** Keeps the toasts still to read for the next page, after a redirect. */
  save() {
    const left = [...this.shown].reverse().concat(this.queued);
    if (!left.length) return;
    const kept: KeptToast[] = left.map(({ level, message }) => ({
      level,
      message,
    }));
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
    } catch {
      // Storage is blocked: they're lost with the page.
    }
  }

  /** Drops what `save` kept, when the page itself comes back from the back-forward cache. */
  forgetSaved() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Nothing was kept.
    }
  }

  /** Shows, and reads again, the toasts the last page kept. */
  restore() {
    let json: string | null;
    try {
      json = sessionStorage.getItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
    this.#raiseAll(parseKept(json));
  }

  /** Shows the toasts `toastFromServer` left in the cookie, and deletes it. */
  takeFromCookie() {
    const prefix = `${TOAST_COOKIE}=`;
    const pair = document.cookie.split("; ").find((c) => c.startsWith(prefix));
    if (!pair) return;
    document.cookie = `${TOAST_COOKIE}=; path=/; max-age=0`;
    let json: string;
    try {
      json = decodeURIComponent(pair.slice(prefix.length));
    } catch {
      return;
    }
    this.#raiseAll(parseKept(json));
  }

  /** Forgets every toast, shown and queued. */
  clear() {
    this.shown = [];
    this.queued = [];
    this.lines = { status: [], alert: [] };
  }

  #raiseAll(kept: KeptToast[]) {
    for (const { level, message } of kept) this.raise(level, message);
  }

  // Puts a toast at the top, and reads it the first time it shows, so
  // nobody hears about a toast that is still waiting.
  #show(t: ShownToast) {
    if (!t.announced) {
      t.announced = true;
      this.#announce(t);
    }
    this.shown.unshift(t);
  }

  // Shows the toast at the front of the queue in each free place, with a
  // full clock.
  #promote() {
    while (this.shown.length < MOST_SHOWN && this.queued.length) {
      const next = this.queued.shift()!;
      this.#show({ ...next, left: TOAST_DURATION });
    }
  }

  // Each message is a line added to its region, so several in a row are all
  // read; lines go a while later, which isn't announced.
  #announce({ level, message }: ShownToast) {
    const { label, live } = SEVERITIES[level];
    const line = `${label}: ${message}`;
    this.lines[live].push(line);
    setTimeout(() => {
      const lines = this.lines[live];
      const at = lines.indexOf(line);
      if (at >= 0) lines.splice(at, 1);
    }, READ_LINE_FOR);
  }
}

export const toasts = new Toasts();

/**
 * Shows a brief message after an action, such as `toast("success", "Roster
 * saved.")`. It shows on the next page too, after a redirect. Needs one
 * `<Toaster />` in the root layout. Does nothing on the server: there, in
 * a form action or `load`, use `toastFromServer`.
 */
export function toast(level: Severity, message: string) {
  if (BROWSER) toasts.raise(level, message);
}
