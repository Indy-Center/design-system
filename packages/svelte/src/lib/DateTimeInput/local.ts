// Between an instant in UTC and the text of a `datetime-local` box, which
// is the member's own clock in their time zone: `2026-10-20T19:00`.

/** A zone's wall clock at an instant: year, month (1–12), day and time. */
type WallClock = [number, number, number, number, number, number];

const clocks = new Map<string, Intl.DateTimeFormat>();

/** The wall clock in `timeZone` at `ms` since the epoch. */
function wallClock(ms: number, timeZone: string): WallClock {
  let format = clocks.get(timeZone);
  if (!format) {
    format = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    clocks.set(timeZone, format);
  }
  const parts = format.formatToParts(ms);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value);
  return [
    part("year"),
    part("month"),
    part("day"),
    part("hour"),
    part("minute"),
    part("second"),
  ];
}

/** A wall clock read as if it were UTC, in ms; years below 100 as given. */
function asUtc([year, month, day, hour, minute, second]: WallClock): number {
  const at = new Date(0);
  at.setUTCFullYear(year, month - 1, day);
  at.setUTCHours(hour, minute, second, 0);
  return at.getTime();
}

/** How far `timeZone` is ahead of UTC at `ms`, in ms. */
function offset(ms: number, timeZone: string): number {
  const whole = Math.floor(ms / 1000) * 1000;
  return asUtc(wallClock(whole, timeZone)) - whole;
}

/** The instant in an ISO string, as the box's text in `timeZone`; "" if it isn't one. */
export function toLocal(iso: string, timeZone: string): string {
  const at = new Date(iso).getTime();
  if (Number.isNaN(at)) return "";
  const [year, month, day, hour, minute] = wallClock(at, timeZone);
  const pad = (n: number, digits = 2) => String(n).padStart(digits, "0");
  // Four-digit years: the box passes through 0002 as a year is typed.
  const date = [pad(year, 4), pad(month), pad(day)].join("-");
  return `${date}T${pad(hour)}:${pad(minute)}`;
}

const BOX_TEXT = /^(\d{4,})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/;

/**
 * The box's text, a wall clock in `timeZone`, as an ISO string in UTC;
 * undefined while it's empty. As browsers read a local time: one the
 * clocks skip moves on by the gap (2:30 AM becomes 3:30 AM), and one they
 * pass twice is the first.
 */
export function fromLocal(text: string, timeZone: string): string | undefined {
  const match = BOX_TEXT.exec(text);
  if (!match) return undefined;
  const [, year, month, day, hour, minute, second = "0"] = match;
  const wall = asUtc([
    Number(year),
    Number(month),
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ]);
  if (Number.isNaN(wall)) return undefined;
  // The zone's offsets either side of this wall clock, which differ only
  // near a change of clocks.
  const before = offset(wall - 86_400_000, timeZone);
  const after = offset(wall + 86_400_000, timeZone);
  const fits = (o: number) => offset(wall - o, timeZone) === o;
  // Passed twice: the first, under the offset before. Skipped: also under
  // the offset before, which lands past the gap.
  const at = fits(before) || !fits(after) ? wall - before : wall - after;
  return new Date(at).toISOString();
}

/** An ISO string in another offset as UTC; anything else as it was given. */
export function toUtc(iso: string): string {
  const at = new Date(iso);
  return Number.isNaN(at.getTime()) ? iso : at.toISOString();
}

/**
 * The zone as people say it, "Eastern Daylight Time", at `at`; its ID where
 * en-US has only an offset for it ("GMT+03:00").
 */
export function zoneName(timeZone: string, at = new Date()): string {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "long",
  })
    .formatToParts(at)
    .find((part) => part.type === "timeZoneName")?.value;
  return name && !/^GMT[+-]/.test(name) ? name : timeZone;
}
