// A four-digit 24-hour Zulu time standing alone: HH 00–23, MM 00–59.
const ZULU_TIME = /\b([01]\d|2[0-3])([0-5]\d)[zZ]\b/;

/**
 * When a controller said they'd log out, from their controller info: the
 * first `2330z` or `2330Z` in it, taken as its next occurrence at or after
 * `loggedInAt`, so `0130Z` after a 2051Z log-in is the next day. Undefined
 * when the info has no such time, or `loggedInAt` isn't a date.
 *
 * `info` is the text as written, or VATSIM's lines of it (`text_atis`).
 * A booking's end, once bookings run, wins over this.
 */
export function logoffFromInfo(
  info: string | readonly string[] | null | undefined,
  loggedInAt: Date | string | number,
): Date | undefined {
  const text = typeof info === "string" ? info : (info ?? []).join("\n");
  const found = ZULU_TIME.exec(text);
  const after = new Date(loggedInAt);
  if (!found || Number.isNaN(after.getTime())) return undefined;

  // Compared to the minute: the info has no seconds.
  const loginMinute = new Date(after);
  loginMinute.setUTCSeconds(0, 0);
  const at = new Date(loginMinute);
  at.setUTCHours(Number(found[1]), Number(found[2]));
  if (at < loginMinute) at.setUTCDate(at.getUTCDate() + 1);
  return at;
}
