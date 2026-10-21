import { BROWSER } from "esm-env";
import { getContext, setContext } from "svelte";
import {
  writePreferenceCookie,
  type PreferenceCookieOptions,
} from "../preferenceCookie/preferenceCookie.js";
import {
  COOKIE_NAME,
  isTimeZone,
  profileSetting,
  timeZoneCookieValue,
  type TimeZoneChoice,
  type TimeZoneProfileSetting,
} from "./timeZone.js";

export type SetTimeZoneOptions = PreferenceCookieOptions & {
  /**
   * For a signed-in member: saves each choice to their identity profile as
   * well as the cookie, with no extra step. Given `"zulu"`, `"device"` or
   * an IANA name. Leave it out when nobody is signed in.
   */
  saveToProfile?: (setting: TimeZoneProfileSetting) => unknown;
};

/** What the member can pick: following the device takes its zone itself. */
export type TimeZonePick =
  { kind: "zulu" } | { kind: "device" } | { kind: "zone"; zone: string };

/** The device's zone, as the browser reports it. */
function deviceZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * The page's time zone: the member's choice, the device's zone once the
 * browser knows it, and the way to save a new choice. Shared by every
 * `Time`, the time-zone setting and the line above a list of times.
 */
export class TimeZoneState {
  #options: SetTimeZoneOptions;

  /** The saved choice, from the server, then as the member changes it. */
  choice: TimeZoneChoice | undefined = $derived.by(() => this.#read());

  /** The device's zone; unknown until a component mounts. */
  device: string | undefined = $state();

  #read: () => TimeZoneChoice | undefined;

  constructor(
    read: () => TimeZoneChoice | undefined,
    options: SetTimeZoneOptions = {},
  ) {
    this.#read = read;
    this.#options = options;
  }

  /** Whether a choice also goes to the member's profile. */
  get savesToProfile(): boolean {
    return this.#options.saveToProfile !== undefined;
  }

  /** Whether times are shown in Zulu by the member's choice. */
  get zulu(): boolean {
    return this.choice?.kind === "zulu";
  }

  /**
   * The zone local times are drawn in, or undefined while it isn't known.
   * `inBrowser` is whether the component asking has mounted: until then
   * it draws what the server drew, so hydration matches.
   */
  zone(inBrowser: boolean): string | undefined {
    const choice = this.choice;
    if (choice?.kind === "zulu") return undefined;
    if (choice?.kind === "zone") return choice.zone;
    if (inBrowser && this.device) return this.device;
    return choice?.zone;
  }

  /**
   * Called once a component is in the browser: reads the device's zone,
   * and when the member follows it and it has moved (after travel),
   * rewrites the cookie so the server draws the new zone next time.
   */
  mount(): void {
    const device = deviceZone();
    this.device = device;
    const choice = this.choice;
    if (choice?.kind === "device" && choice.zone !== device) {
      this.#save({ kind: "device", zone: device }, false);
    }
  }

  /** Saves the member's pick and applies it at once. In the browser only. */
  choose(pick: TimeZonePick): void {
    const choice: TimeZoneChoice =
      pick.kind === "device"
        ? { kind: "device", zone: (this.device ??= deviceZone()) }
        : pick;
    this.#save(choice, true);
  }

  #save(choice: TimeZoneChoice, toProfile: boolean) {
    if (choice.kind !== "zulu" && !isTimeZone(choice.zone)) return;
    writePreferenceCookie(COOKIE_NAME, timeZoneCookieValue(choice), {
      domain: this.#options.domain,
    });
    this.choice = choice;
    const save = this.#options.saveToProfile;
    if (toProfile && save) {
      Promise.resolve()
        .then(() => save(profileSetting(choice)))
        .catch((error: unknown) =>
          console.error("Time zone: the profile save failed:", error),
        );
    }
  }
}

const key = Symbol("@indy-center/svelte time zone");

/**
 * Gives every component below this one the member's time zone, so `Time`
 * draws it from the server on and the time-zone controls save to it. Call
 * it once, in the root layout, with a function returning the choice the
 * server `load` read with `readTimeZone`:
 * `setTimeZone(() => data.timeZone, { saveToProfile })`.
 */
export function setTimeZone(
  read: () => TimeZoneChoice | undefined,
  options?: SetTimeZoneOptions,
): TimeZoneState {
  return setContext(key, new TimeZoneState(read, options));
}

/** No layout set one: nothing saved, shared by the page in the browser. */
let fallback: TimeZoneState | undefined;

/**
 * The page's time zone, as the root layout set it with `setTimeZone`.
 * Without one, nothing is saved: times follow the device.
 */
export function getTimeZone(): TimeZoneState {
  const set = getContext<TimeZoneState | undefined>(key);
  if (set) return set;
  // On the server, one per caller: module state there is shared by requests.
  if (!BROWSER) return new TimeZoneState(() => undefined);
  return (fallback ??= new TimeZoneState(() => undefined));
}
