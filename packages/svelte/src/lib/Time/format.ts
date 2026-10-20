import { formatDuration } from "../aviation/duration.js";

/** Which zones `Time` shows: local, Zulu, or local then Zulu. */
export type TimeZoneShown = "local" | "zulu" | "both";

/** A run of `Time`'s text; `at` is the instant it shows, if any. */
export type Piece = { text: string; at?: Date };

/**
 * `Time`'s text, in pieces: `Today, 7:00 PM–10:00 PM EDT · 2300Z–0200Z`.
 * `timeZone` is the member's zone, or undefined when it isn't known (on the
 * server), which draws Zulu.
 */
export function pieces(options: {
  start: Date;
  end?: Date;
  date: boolean;
  zone: TimeZoneShown;
  timeZone?: string;
  now: Date;
}): Piece[] {
  const { start, end, date, zone, now } = options;
  const timeZone = zone === "zulu" ? undefined : options.timeZone;
  const dayIn = timeZone ?? "UTC";
  const prefix = (at: Date) => (date ? `${day(at, now, dayIn)}, ` : "");
  const full = (at: Date) =>
    timeZone ? `${clock(at, timeZone)} ${zoneName(at, timeZone)}` : zulu(at);
  const withZulu = timeZone && zone === "both";

  if (!end) {
    const text =
      prefix(start) + full(start) + (withZulu ? ` · ${zulu(start)}` : "");
    return [{ text, at: start }];
  }

  // A range shares its day and its zone name between the ends, when they
  // have the same.
  const sameDay = day(start, now, dayIn) === day(end, now, dayIn);
  const sameZone =
    !timeZone || zoneName(start, timeZone) === zoneName(end, timeZone);
  const startText =
    prefix(start) +
    (timeZone && sameZone ? clock(start, timeZone) : full(start));
  const endText = (sameDay ? "" : prefix(end)) + full(end);
  const range: Piece[] = [
    { text: startText, at: start },
    { text: "–" },
    { text: endText, at: end },
  ];
  if (!withZulu) return range;
  return [
    ...range,
    { text: " · " },
    { text: zulu(start), at: start },
    { text: "–" },
    { text: zulu(end), at: end },
  ];
}

/**
 * How far `at` is from `now`, in short units: "in 2 h" to come, and a bare
 * "1 h 23 m" gone by, which the caller labels ("online", "ago").
 */
export function relative(at: Date, now: Date): string {
  const minutes = Math.round((at.getTime() - now.getTime()) / 60_000);
  const length = formatDuration(minutes, "short");
  return minutes > 0 ? `in ${length}` : length;
}

/** Zulu as four digits and a `Z`: `2300Z`. */
function zulu(at: Date): string {
  const h = String(at.getUTCHours()).padStart(2, "0");
  const m = String(at.getUTCMinutes()).padStart(2, "0");
  return `${h}${m}Z`;
}

/** The time on a clock in `timeZone`: `7:00 PM`. */
function clock(at: Date, timeZone: string): string {
  return format(at, timeZone, { hour: "numeric", minute: "2-digit" });
}

/** `timeZone`'s abbreviation at `at`: `EDT`, or `GMT+1` where none is set. */
function zoneName(at: Date, timeZone: string): string {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "short" })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value ?? timeZone
  );
}

/**
 * The day `at` falls on in `timeZone`, seen from `now`: "Today",
 * "Tomorrow", the weekday within the coming week ("Thursday"), else the
 * day before the month ("Tue 27 Oct"), with the year when it isn't this
 * year ("Thu 4 Mar 2027").
 */
function day(at: Date, now: Date, timeZone: string): string {
  const date = calendarDate(at, timeZone);
  const today = calendarDate(now, timeZone);
  const days = (date.utc - today.utc) / 86_400_000;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  const part = (options: Intl.DateTimeFormatOptions) =>
    format(at, timeZone, options);
  if (days > 1 && days < 7) return part({ weekday: "long" });
  const year = date.year === today.year ? "" : ` ${date.year}`;
  return `${part({ weekday: "short" })} ${date.day} ${part({ month: "short" })}${year}`;
}

/** The calendar date `at` falls on in `timeZone`, and its midnight in UTC. */
function calendarDate(at: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(at);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value);
  const [year, month, day] = [get("year"), get("month"), get("day")];
  return { year, day, utc: Date.UTC(year, month - 1, day) };
}

// Browsers put a narrow no-break space before "PM"; written text uses a
// plain one.
function format(
  at: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat("en-US", { timeZone, ...options })
    .format(at)
    .replace(/ /g, " ");
}
