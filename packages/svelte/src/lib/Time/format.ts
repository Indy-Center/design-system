import { formatDuration } from "../aviation/duration.js";

/** Which zones `Time` shows: local, Zulu, or local then Zulu. */
export type TimeZoneShown = "local" | "zulu" | "both";

/** What `Time` shows: the time, the day and time, or how far off it is. */
export type TimeShown = "time" | "datetime" | "relative";

/** A run of `Time`'s text; `at` is the instant it shows, if any. */
export type Piece = { text: string; at?: Date };

/**
 * `Time`'s text, in pieces: `Today, 7:00 PM–10:00 PM EDT · 2300Z–0200Z`.
 * `memberZone` is the member's IANA zone, or undefined where it isn't known
 * (on the server), which draws Zulu. `now` is called only when the text
 * depends on it, so a caller tracking it follows only those that do.
 */
export function timeText(options: {
  start: Date;
  end?: Date;
  show: TimeShown;
  zone: TimeZoneShown;
  memberZone?: string;
  now: () => Date;
}): Piece[] {
  const { start, end, show, zone, memberZone } = options;
  if (show === "relative") {
    return [{ text: relative(start, options.now()), at: start }];
  }

  const local = zone === "zulu" ? undefined : memberZone;
  const clock = local ? localClock(local) : zuluClock;
  const withZulu = local !== undefined && zone === "both";
  const now = show === "datetime" ? options.now() : undefined;
  const dayOf = (at: Date) => (now ? clock.day(at, now) : undefined);
  const withDay = (at: Date, time: string) =>
    [dayOf(at), time].filter(Boolean).join(", ");
  const timeAndZone = (at: Date) =>
    [clock.time(at), clock.zoneName(at)].filter(Boolean).join(" ");

  if (!end) {
    const text =
      withDay(start, timeAndZone(start)) +
      (withZulu ? ` · ${zuluClock.time(start)}` : "");
    return [{ text, at: start }];
  }

  // A range shares its day and its zone name between the ends, when they
  // have the same.
  const sameDay = dayOf(start) === dayOf(end);
  const sameZone = clock.zoneName(start) === clock.zoneName(end);
  const startTime = sameZone ? clock.time(start) : timeAndZone(start);
  const range: Piece[] = [
    { text: withDay(start, startTime), at: start },
    { text: "–" },
    {
      text: sameDay ? timeAndZone(end) : withDay(end, timeAndZone(end)),
      at: end,
    },
  ];
  if (!withZulu) return range;
  return [
    ...range,
    { text: " · " },
    { text: zuluClock.time(start), at: start },
    { text: "–" },
    { text: zuluClock.time(end), at: end },
  ];
}

/**
 * How far `at` is from `now`, in short units: "in 2 h" to come, and a bare
 * "1 h 23 m" gone by, which the caller labels ("online", "ago").
 */
function relative(at: Date, now: Date): string {
  const minutes = Math.round((at.getTime() - now.getTime()) / 60_000);
  const length = formatDuration(minutes, "short");
  return minutes > 0 ? `in ${length}` : length;
}

/** How one zone writes an instant. */
type Clock = {
  /** The time on its clock: `7:00 PM`, or `2300Z` in Zulu. */
  time(at: Date): string;
  /** The zone's abbreviation at `at` (`EDT`); none for Zulu, whose `Z` says it. */
  zoneName(at: Date): string | undefined;
  /** The day `at` falls on in the zone, seen from `now` (see `dayLabel`). */
  day(at: Date, now: Date): string;
};

/** Zulu: four digits and a `Z`, and the UTC day. */
const zuluClock: Clock = {
  time: (at) => {
    const h = String(at.getUTCHours()).padStart(2, "0");
    const m = String(at.getUTCMinutes()).padStart(2, "0");
    return `${h}${m}Z`;
  },
  zoneName: () => undefined,
  day: (at, now) => dayLabel(at, now, "UTC"),
};

/** A member's zone: the 12-hour clock and the zone's abbreviation. */
function localClock(timeZone: string): Clock {
  return {
    time: (at) => {
      const { hour, minute, dayPeriod } = partsOf(at, timeZone, {
        hour: "numeric",
        minute: "2-digit",
      });
      return `${hour}:${minute} ${dayPeriod}`;
    },
    // A zone without an abbreviation in en-US gives its offset: `GMT+1`.
    zoneName: (at) =>
      partsOf(at, timeZone, { timeZoneName: "short" }).timeZoneName ?? timeZone,
    day: (at, now) => dayLabel(at, now, timeZone),
  };
}

/**
 * The day `at` falls on in `timeZone`, seen from `now`: "Today",
 * "Tomorrow", the weekday within the coming week ("Thursday"), else the
 * day before the month ("Tue 27 Oct"), with the year when it isn't this
 * year ("Thu 4 Mar 2027").
 */
function dayLabel(at: Date, now: Date, timeZone: string): string {
  const date = calendarDate(at, timeZone);
  const today = calendarDate(now, timeZone);
  const days = (date.midnightUtc - today.midnightUtc) / 86_400_000;
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1 && days < 7) {
    return partsOf(at, timeZone, { weekday: "long" }).weekday ?? "";
  }
  const { weekday, day, month } = partsOf(at, timeZone, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const year = date.year === today.year ? "" : ` ${date.year}`;
  return `${weekday} ${day} ${month}${year}`;
}

/** The calendar date `at` falls on in `timeZone`, and that date's midnight in UTC. */
function calendarDate(at: Date, timeZone: string) {
  const parts = partsOf(at, timeZone, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const [year, month, day] = [parts.year, parts.month, parts.day].map(Number);
  return { year, midnightUtc: Date.UTC(year, month - 1, day) };
}

/** `at` in `timeZone`, as Intl's named parts in US English. */
function partsOf(
  at: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Partial<Record<Intl.DateTimeFormatPartTypes, string>> {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, ...options })
    .formatToParts(at)
    .map((p) => [p.type, p.value]);
  return Object.fromEntries(parts);
}
