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

export function formatFrequency(hz: number): string {
  return (hz / 1_000_000).toFixed(3);
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
