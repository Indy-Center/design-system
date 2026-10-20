// PROTOTYPE (throwaway, branch prototype/preferences; ticket 11): the
// time-zone and colour-scheme choices. Not for main.
//
// The points to decide, each with lettered variants; `?v=` holds one letter
// per point, in this order, so `?v=CDBBAA` is where C, wording D, …
import { replaceState } from "$app/navigation";
import { saveColorScheme } from "../../lib/index.ts";
import { COOKIE_NAME as SCHEME_COOKIE } from "../../lib/colorScheme/colorScheme.ts";

export type PointKey =
  "where" | "wording" | "format" | "undo" | "scheme" | "note";
type Variant = { key: string; note: string };
export type Point = {
  key: PointKey;
  name: string;
  variants: Variant[];
  /** The prototype's recommendation. */
  recommend: string;
};

export const points: Point[] = [
  {
    key: "where",
    name: "Time zone: where it lives",
    recommend: "C",
    variants: [
      { key: "A", note: "User menu only, beside the colour scheme." },
      {
        key: "B",
        note: "Settings page only; the menu just links to Settings.",
      },
      {
        key: "C",
        note: "Both: the menu switches this browser; Settings picks a zone and saves it to your profile.",
      },
    ],
  },
  {
    key: "wording",
    name: "Time zone: wording",
    recommend: "D",
    variants: [
      {
        key: "A",
        note: "A switch, “Local times”, with the zone named under it.",
      },
      {
        key: "B",
        note: "Two buttons, “Zulu | Local”, like the colour scheme.",
      },
      {
        key: "C",
        note: "A sentence: “Times are in Zulu. Show them in Indianapolis time?”, then “Show times in Zulu”.",
      },
      {
        key: "D",
        note: "Three rows like the colour scheme: Zulu, “Use my device's time zone” (follows the device, even after you travel), and “Another time zone” with a picker.",
      },
    ],
  },
  {
    key: "format",
    name: "Time zone: how a local time looks",
    recommend: "B",
    variants: [
      { key: "A", note: "Local only: “Sat 31 Oct, 7:00 PM EDT”." },
      {
        key: "B",
        note: "Local, then Zulu: “Sat 31 Oct, 7:00 PM EDT · 2300Z”.",
      },
      { key: "C", note: "Zulu first, local under it, smaller." },
    ],
  },
  {
    key: "undo",
    name: "Time zone: “Show times in Zulu” on the page",
    recommend: "B",
    variants: [
      { key: "A", note: "Only in the setting itself (menu or Settings)." },
      {
        key: "B",
        note: "Also one line above each list of times: “Times in EDT · Show times in Zulu” (and the offer when in Zulu).",
      },
    ],
  },
  {
    key: "scheme",
    name: "Colour scheme: the control",
    recommend: "A",
    variants: [
      {
        key: "A",
        note: "Three rows: Light, Dark, “Use my device's setting”; one is always ticked.",
      },
      {
        key: "B",
        note: "Light | Dark buttons, and a “Use my device's setting” link only while a choice is saved.",
      },
      { key: "C", note: "Three buttons: Light | Dark | Device." },
    ],
  },
  {
    key: "note",
    name: "Both: the note by the control",
    recommend: "A",
    variants: [
      { key: "A", note: "Always shown under the control." },
      { key: "B", note: "Shown only after a click, as the confirmation." },
      { key: "C", note: "Behind a “What's saved?” button under the control." },
    ],
  },
];

export const NOTE =
  "Saved on this browser for a year, across flyindycenter.com.";

/** The chosen variant of each point, kept in `?v=`. */
export const chosen = $state<Record<PointKey, string>>(
  Object.fromEntries(points.map((p) => [p.key, p.recommend])) as Record<
    PointKey,
    string
  >,
);

export function readVariants(url: {
  searchParams: { get(name: string): string | null };
}) {
  const v = url.searchParams.get("v") ?? "";
  points.forEach((p, i) => {
    const letter = v[i];
    if (letter && p.variants.some((o) => o.key === letter))
      chosen[p.key] = letter;
  });
}

export function variantQuery(): string {
  return "?v=" + points.map((p) => chosen[p.key]).join("");
}

export function choose(key: PointKey, letter: string) {
  chosen[key] = letter;
  replaceState(variantQuery(), {});
}

// ---- Time zone ----------------------------------------------------------

export const TZ_COOKIE = "indy-time-zone";
const ONE_YEAR = 365 * 24 * 60 * 60;
const DOMAIN = "flyindycenter.com";

export function isZone(v: string | undefined): v is string {
  if (!v || v.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en", { timeZone: v });
    return true;
  } catch {
    return false;
  }
}

function cookieAttrs(maxAge: number) {
  const host = location.hostname;
  const onDomain = host === DOMAIN || host.endsWith(`.${DOMAIN}`);
  return [
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
    ...(onDomain ? [`Domain=${DOMAIN}`] : []),
    ...(location.protocol === "https:" ? ["Secure"] : []),
  ];
}

/**
 * "Use my device's time zone" is saved as `device:<zone>`: the zone lets the
 * server draw local times from the start, and the prefix tells the browser to
 * rewrite it when the device's zone changes (after travel).
 */
export const FOLLOW = "device:";

/** Split a cookie value into the zone and whether it follows the device. */
export function parseZoneCookie(v: string | undefined): {
  zone: string | undefined;
  follow: boolean;
} {
  const follow = !!v?.startsWith(FOLLOW);
  const zone = follow ? v!.slice(FOLLOW.length) : v;
  return isZone(zone) ? { zone, follow } : { zone: undefined, follow: false };
}

/** The member asked for local times: write the cookie (browser only). */
export function saveTimeZone(zone: string, follow = false) {
  const value = (follow ? FOLLOW : "") + zone;
  document.cookie = [`${TZ_COOKIE}=${value}`, ...cookieAttrs(ONE_YEAR)].join(
    "; ",
  );
  prefs.zone = zone;
  prefs.follow = follow;
}

/** "Use my device's time zone". */
export function followDevice() {
  saveTimeZone(prefs.device, true);
}

/** "Show times in Zulu": delete the cookie. */
export function clearTimeZone() {
  document.cookie = [`${TZ_COOKIE}=`, ...cookieAttrs(0)].join("; ");
  prefs.zone = undefined;
  prefs.follow = false;
}

/**
 * The device's zone changed (or the pretend switch moved): a following
 * cookie catches up, as it would on the next page load after travel.
 */
export function setDevice(zone: string) {
  prefs.device = zone;
  if (prefs.follow && prefs.zone !== zone) followDevice();
}

// ---- Colour scheme ------------------------------------------------------

export type SchemeChoice = "light" | "dark" | "device";

/** The prototype `clearColorScheme`: delete the cookie, follow the device. */
export function clearColorScheme() {
  document.cookie = [`${SCHEME_COOKIE}=`, ...cookieAttrs(0)].join("; ");
  const d = document.documentElement;
  if (matchMedia("(prefers-color-scheme: dark)").matches)
    d.dataset.theme = "dark";
  else delete d.dataset.theme;
}

export function setScheme(choice: SchemeChoice) {
  if (choice === "device") clearColorScheme();
  else saveColorScheme(choice);
  prefs.scheme = choice;
  prefs.savedOnce = true;
}

// ---- Shared state -------------------------------------------------------

export const prefs = $state<{
  /** The zone in the cookie; none means Zulu. */
  zone: string | undefined;
  /** The cookie follows the device ("Use my device's time zone"). */
  follow: boolean;
  /** What the device says (or the pretend zone). */
  device: string;
  scheme: SchemeChoice;
  /** Fake identity profile: the preferred zone saved there. */
  profileZone: string | undefined;
  /** A save happened since load (for note variant B). */
  savedOnce: boolean;
}>({
  zone: undefined,
  follow: false,
  device: "America/Indiana/Indianapolis",
  scheme: "device",
  profileZone: undefined,
  savedOnce: false,
});

export function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

/** Read the browser's state after mount. */
export function readBrowser() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // A headless or UTC machine has no interesting local time; pretend Indy.
  let device = prefs.device;
  if (detected && !/^(UTC|Etc\/)/.test(detected)) device = detected;
  try {
    device = sessionStorage.getItem("prototype-device-zone") ?? device;
  } catch {
    /* no storage: no pretend zone */
  }
  const { zone, follow } = parseZoneCookie(readCookie(TZ_COOKIE));
  prefs.zone = zone;
  prefs.follow = follow;
  setDevice(device);
  const s = readCookie(SCHEME_COOKIE);
  prefs.scheme = s === "light" || s === "dark" ? s : "device";
  try {
    prefs.profileZone =
      sessionStorage.getItem("prototype-profile-zone") ?? undefined;
  } catch {
    /* no storage: the fake profile starts empty */
  }
}

/** Fake identity's profile save (identity ticket time-zone/01). */
export async function saveToProfile(zone: string | undefined) {
  await new Promise((done) => setTimeout(done, 600));
  prefs.profileZone = zone;
  try {
    if (zone) sessionStorage.setItem("prototype-profile-zone", zone);
    else sessionStorage.removeItem("prototype-profile-zone");
  } catch {
    /* ignore */
  }
}

// ---- Formatting ---------------------------------------------------------

/** "Indianapolis" from "America/Indiana/Indianapolis". */
export function city(zone: string): string {
  return zone.split("/").at(-1)!.replaceAll("_", " ");
}

export function shortName(zone: string, at = new Date()): string {
  return (
    new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "short" })
      .formatToParts(at)
      .find((p) => p.type === "timeZoneName")?.value ?? zone
  );
}

export function zulu(d: Date): { day: string; time: string } {
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
  const time =
    String(d.getUTCHours()).padStart(2, "0") +
    String(d.getUTCMinutes()).padStart(2, "0") +
    "Z";
  return { day, time };
}

export function local(d: Date, zone: string): { day: string; time: string } {
  const day = new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
  return { day, time: `${time} ${shortName(zone, d)}` };
}

/** Store the pretend device zone so a reload keeps it. */
export function pretendDevice(zone: string) {
  try {
    sessionStorage.setItem("prototype-device-zone", zone);
  } catch {
    /* ignore */
  }
  setDevice(zone);
}

export const ZONES = [
  "America/New_York",
  "America/Indiana/Indianapolis",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
];

export const samples = [
  {
    kind: "Event",
    title: "Indy Center FNO: Midwest Madness",
    start: new Date("2026-10-31T23:00:00Z"),
    end: new Date("2026-11-01T03:00:00Z"),
  },
  {
    kind: "Training session",
    title: "OTS: IND_APP with K. Alvarez",
    start: new Date("2026-11-03T00:30:00Z"),
    end: new Date("2026-11-03T02:00:00Z"),
  },
];
