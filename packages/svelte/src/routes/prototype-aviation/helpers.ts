// Throwaway helpers for the aviation prototype. Not the package's API.
import positions from "./zid-positions.json";

export type VnasPosition = (typeof positions)[number];

export type Resolved =
  | { kind: "exact"; login: string; position: VnasPosition }
  | { kind: "relief"; login: string; position: VnasPosition }
  | { kind: "unknown"; login: string };

const byCallsign = new Map(positions.map((p) => [p.callsign, p]));

// component-list's relief rule: exact; else drop one trailing digit from the
// middle part; else drop an all-digit middle part; else unknown.
export function resolvePosition(login: string): Resolved {
  const exact = byCallsign.get(login);
  if (exact) return { kind: "exact", login, position: exact };
  const parts = login.split("_");
  if (parts.length === 3) {
    const [prefix, middle, type] = parts;
    if (middle.length > 1 && /\d$/.test(middle)) {
      const p = byCallsign.get(`${prefix}_${middle.slice(0, -1)}_${type}`);
      if (p) return { kind: "relief", login, position: p };
    }
    if (/^\d+$/.test(middle)) {
      const p = byCallsign.get(`${prefix}_${type}`);
      if (p) return { kind: "relief", login, position: p };
    }
  }
  return { kind: "unknown", login };
}

// US frequencies need two decimals: the third is cut, not rounded
// (128.225 MHz shows as 128.22, as the spoken form does).
// `decimals: 3` is the dormant flag for 8.33 kHz spacing, if the US ever
// adopts it.
export function formatFrequency(hz: number, decimals: 2 | 3 = 2): string {
  const whole = Math.floor(hz / 1_000_000);
  const step = decimals === 3 ? 1_000 : 10_000;
  const frac = String(Math.floor((hz % 1_000_000) / step)).padStart(
    decimals,
    "0",
  );
  return `${whole}.${frac}`;
}

// 7110.65 2-4-17: separate digits, "point" for the decimal, drop digits after
// the second decimal; 2-4-16: nine is "niner".
const words = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "niner",
];
export function spokenFrequency(hz: number): string {
  const [whole, frac] = formatFrequency(hz).split(".");
  const kept = frac.slice(0, 2).replace(/0+$/, "") || "0";
  const say = (s: string) => [...s].map((d) => words[+d]).join(" ");
  return `${say(whole)} point ${say(kept)}`;
}

// The prototype's clock, fixed so screenshots don't change.
export const NOW = new Date("2026-10-20T21:00:00Z");
export const ZONE = "America/Indiana/Indianapolis";

export function localTime(d: Date, hour12 = true): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12,
    timeZoneName: "short",
  }).format(d);
}

export function zulu(d: Date, colon = false): string {
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return colon ? `${h}:${m}Z` : `${h}${m}Z`;
}

export function localDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(d);
}

// The log-out time a controller wrote in their info: the first "2330z" or
// "2330Z" (24-hour Zulu), taken as its next occurrence after `after` (when
// they logged in). Undefined when there's none or it isn't a time.
export function parseLogoff(info: string, after: Date): Date | undefined {
  const m = /\b([01]\d|2[0-3])([0-5]\d)[zZ]\b/.exec(info);
  if (!m) return undefined;
  const d = new Date(after);
  d.setUTCHours(+m[1], +m[2], 0, 0);
  if (d < after) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

// Round 2: date formats for point 7's date part.
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-US", { timeZone: ZONE, ...o }).format(d);
const dayKey = (d: Date) =>
  fmt(d, { year: "numeric", month: "2-digit", day: "2-digit" });
const sameYear = (d: Date) =>
  fmt(d, { year: "numeric" }) === fmt(NOW, { year: "numeric" });
const year = (d: Date, sep = ", ") =>
  sameYear(d) ? "" : `${sep}${fmt(d, { year: "numeric" })}`;

export type DateStyle = "A" | "B" | "C" | "D" | "E";
export function formatDate(d: Date, style: DateStyle): string {
  switch (style) {
    case "A":
      return (
        fmt(d, { weekday: "short", month: "short", day: "numeric" }) + year(d)
      );
    case "B":
      return (
        fmt(d, { weekday: "long", month: "long", day: "numeric" }) + year(d)
      );
    case "C":
      return fmt(d, { month: "short", day: "numeric" }) + year(d);
    case "D": {
      const days = Math.round(
        (Date.parse(dayKey(d)) - Date.parse(dayKey(NOW))) / 86_400_000,
      );
      if (days === 0) return "Today";
      if (days === 1) return "Tomorrow";
      if (days > 1 && days < 7) return fmt(d, { weekday: "long" });
      // Chosen in round 3: D, with the day before the month after a week.
      return formatDate(d, "E");
    }
    case "E":
      return (
        `${fmt(d, { weekday: "short" })} ${fmt(d, { day: "numeric" })} ` +
        fmt(d, { month: "short" }) +
        year(d, " ")
      );
  }
}

// Minutes between two instants, split into hours and minutes.
export function hm(from: Date, to: Date) {
  const mins = Math.round(Math.abs(to.getTime() - from.getTime()) / 60_000);
  return { h: Math.floor(mins / 60), m: mins % 60, mins };
}

export function durationShort(from: Date, to: Date): string {
  const { h, m } = hm(from, to);
  return (
    [h ? `${h} h` : "", m ? `${m} m` : ""].filter(Boolean).join(" ") || "0 m"
  );
}

export function durationLong(from: Date, to: Date): string {
  const { h, m } = hm(from, to);
  const part = (n: number, w: string) =>
    n ? `${n} ${w}${n === 1 ? "" : "s"}` : "";
  return [part(h, "hour"), part(m, "minute")].filter(Boolean).join(" ");
}

export function durationClock(from: Date, to: Date): string {
  const { h, m } = hm(from, to);
  return `${h}:${String(m).padStart(2, "0")}`;
}

export function isoDuration(from: Date, to: Date): string {
  const { h, m } = hm(from, to);
  return `PT${h}H${m}M`;
}

export const RATINGS: Record<string, string> = {
  OBS: "Observer",
  S1: "Tower Trainee",
  S2: "Tower Controller",
  S3: "Senior Student",
  C1: "Enroute Controller",
  C3: "Senior Controller",
  I1: "Instructor",
  I3: "Senior Instructor",
  SUP: "Supervisor",
  ADM: "Administrator",
};

export type CredentialKind = "certification" | "endorsement" | "solo";
export const CREDENTIALS: {
  code: string;
  name: string;
  kind: CredentialKind;
}[] = [
  { code: "S-GC", name: "Simple Ground Control", kind: "certification" },
  { code: "A-LC", name: "Advanced Local Control", kind: "certification" },
  { code: "S-LC", name: "Simple Local Control", kind: "endorsement" },
  { code: "APP-SOLO", name: "Approach solo, until Nov 3", kind: "solo" },
];

export const CATEGORIES = ["VFR", "MVFR", "IFR", "LIFR"] as const;
export type Category = (typeof CATEGORIES)[number];
export const CATEGORY_NAMES: Record<Category, string> = {
  VFR: "Visual flight rules",
  MVFR: "Marginal VFR",
  IFR: "Instrument flight rules",
  LIFR: "Low IFR",
};

export const AIRPORTS = [
  { icao: "KIND", name: "Indianapolis International" },
  { icao: "KCVG", name: "Cincinnati/Northern Kentucky International" },
  { icao: "KLEX", name: "Blue Grass" },
];

// A position's airport, from its callsign's prefix: a cab's own airport, or
// an approach's primary one. Centers have none. The real component would
// take it from data, not guess.
export function airportOf(callsign: string) {
  const parts = callsign.split("_");
  if (!["TWR", "GND", "DEL", "RMP", "APP"].includes(parts[parts.length - 1]))
    return undefined;
  const icao = `K${parts[0]}`;
  return AIRPORTS.find((a) => a.icao === icao) ?? { icao, name: "" };
}
