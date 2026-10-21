// The time-zone choice, its cookie and the profile setting: plain
// functions, for the server and the browser alike.

/**
 * A member's saved time-zone choice:
 *
 * - `zulu`: every time in Zulu.
 * - `device`: "Use my device's time zone". `zone` is the zone this browser
 *   was last in, so the server can draw it; unknown when the choice came
 *   from the profile and this browser hasn't saved one yet.
 * - `zone`: "Another time zone", an IANA name.
 *
 * No choice at all (undefined) is local by default: Zulu from the server,
 * then the device's zone in the browser.
 */
export type TimeZoneChoice =
  | { kind: "zulu" }
  | { kind: "device"; zone?: string }
  | { kind: "zone"; zone: string };

/**
 * The choice as the member's identity profile holds it: an IANA name,
 * `"device"` or `"zulu"`.
 */
// `string & {}` keeps the two words in editors' suggestions.
export type TimeZoneProfileSetting = "zulu" | "device" | (string & {});

/** The cookie every Indy Center app shares; written only on a choice. */
export const COOKIE_NAME = "indy-time-zone";

/** How following the device starts in the cookie: `device:America/Chicago`. */
const DEVICE_PREFIX = "device:";

/** Longer than any IANA name; anything longer is junk. */
const MAX_LENGTH = 64;

let listed: Set<string> | undefined;

/**
 * Whether `name` is a time zone this runtime knows: in
 * `Intl.supportedValuesOf('timeZone')` once canonicalised (runtimes list
 * different names for one zone, such as Asia/Kolkata and Asia/Calcutta),
 * or UTC, which the list leaves out. Length capped.
 */
export function isTimeZone(name: string | undefined): name is string {
  if (!name || name.length > MAX_LENGTH || !/^[\w+\-/]+$/.test(name)) {
    return false;
  }
  let canonical: string;
  try {
    canonical = new Intl.DateTimeFormat("en-US", {
      timeZone: name,
    }).resolvedOptions().timeZone;
  } catch {
    return false;
  }
  listed ??= new Set(Intl.supportedValuesOf("timeZone"));
  return listed.has(name) || listed.has(canonical) || canonical === "UTC";
}

/** The choice a cookie's value holds, or undefined when it holds none. */
export function parseTimeZoneCookie(
  value: string | undefined,
): TimeZoneChoice | undefined {
  if (value === "zulu") return { kind: "zulu" };
  if (value?.startsWith(DEVICE_PREFIX)) {
    const zone = value.slice(DEVICE_PREFIX.length);
    return isTimeZone(zone) ? { kind: "device", zone } : undefined;
  }
  return isTimeZone(value) ? { kind: "zone", zone: value } : undefined;
}

/** The cookie's value for `choice`. */
export function timeZoneCookieValue(choice: TimeZoneChoice): string {
  if (choice.kind === "zulu") return "zulu";
  if (choice.kind === "device") return `${DEVICE_PREFIX}${choice.zone ?? ""}`;
  return choice.zone;
}

/** The profile's setting for `choice`. */
export function profileSetting(choice: TimeZoneChoice): TimeZoneProfileSetting {
  return choice.kind === "zone" ? choice.zone : choice.kind;
}

/** The choice a profile setting holds, or undefined when it holds none. */
function parseProfileSetting(
  setting: string | undefined,
): TimeZoneChoice | undefined {
  if (setting === "zulu") return { kind: "zulu" };
  if (setting === "device") return { kind: "device" };
  return isTimeZone(setting) ? { kind: "zone", zone: setting } : undefined;
}

export type ReadTimeZoneOptions = {
  /**
   * The signed-in member's setting from their identity profile, if any.
   * This browser's cookie wins over it; it fills in only where no cookie
   * is set (a new browser).
   */
  profile?: TimeZoneProfileSetting | null;
};

/**
 * The member's time-zone choice for this request, from the shared cookie
 * and the profile, for the root layout's server `load` to hand to
 * `setTimeZone`. Undefined when nothing is saved. Any value that isn't a
 * real zone counts as none.
 */
export function readTimeZone(
  cookies: { get(name: string): string | undefined },
  { profile }: ReadTimeZoneOptions = {},
): TimeZoneChoice | undefined {
  return (
    parseTimeZoneCookie(cookies.get(COOKIE_NAME)) ??
    parseProfileSetting(profile ?? undefined)
  );
}
