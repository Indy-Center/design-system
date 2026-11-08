// Browser commands: run in Node, called from tests through
// `commands` in "vitest/browser".
import type { CDPSession, Page } from "playwright";
import type { BrowserCommand, BrowserCommandContext } from "vitest/node";

type DeviceScheme = "light" | "dark" | "no-preference" | null;

/** The Playwright page under test; `command` needs the Playwright provider. */
function playwrightPage(context: BrowserCommandContext, command: string) {
  if (context.provider.name !== "playwright") {
    throw new Error(`${command} needs the Playwright provider`);
  }
  return context.page;
}

/** Sets the device's colour scheme the page sees; null resets it. */
export const emulateColorScheme: BrowserCommand<[DeviceScheme]> = async (
  context,
  colorScheme,
) => {
  await playwrightPage(context, "emulateColorScheme").emulateMedia({
    colorScheme,
  });
};

/** Sets whether the device asks for less motion; null resets it. */
export const emulateReducedMotion: BrowserCommand<
  ["reduce" | "no-preference" | null]
> = async (context, reducedMotion) => {
  await playwrightPage(context, "emulateReducedMotion").emulateMedia({
    reducedMotion,
  });
};

type EmulatedFormat = Intl.DateTimeFormatConstructor & {
  /** The zone a format takes when it names none; null for the browser's. */
  zone?: string | null;
};

/**
 * Run in the test's frame: makes `zone` the one an `Intl.DateTimeFormat`
 * takes when its options name none, null putting the browser's back. The
 * first call puts a wrapper in place of the constructor.
 */
function defaultIntlZone(zone: string | null) {
  let format = Intl.DateTimeFormat as EmulatedFormat;
  if (!("zone" in format)) {
    const native = Intl.DateTimeFormat;
    const emulated = function (
      locales?: Intl.LocalesArgument,
      options?: Intl.DateTimeFormatOptions,
    ) {
      const timeZone = options?.timeZone ?? emulated.zone ?? undefined;
      return new native(locales, { ...options, timeZone });
    } as EmulatedFormat;
    // So a format made here is still `instanceof Intl.DateTimeFormat`.
    Object.defineProperty(emulated, "prototype", { value: native.prototype });
    emulated.supportedLocalesOf = native.supportedLocalesOf;
    Intl.DateTimeFormat = format = emulated;
  }
  format.zone = zone;
}

// One DevTools session per page, kept for the next override.
const sessions = new WeakMap<Page, CDPSession>();

/** Sets the time zone the page's clock reads, an IANA name; null resets it. */
export const emulateTimeZone: BrowserCommand<[string | null]> = async (
  context,
  timeZone,
) => {
  const page = playwrightPage(context, "emulateTimeZone");
  // The DevTools protocol is Chromium's. Playwright sets WebKit's zone
  // only as the page opens, once for the whole run, so there the test's
  // frame gets it through Intl instead: the components read the device's
  // zone only from `Intl.DateTimeFormat`.
  if (page.context().browser()?.browserType().name() !== "chromium") {
    await (await context.frame()).evaluate(defaultIntlZone, timeZone);
    return;
  }
  let cdp = sessions.get(page);
  if (!cdp) {
    cdp = await page.context().newCDPSession(page);
    sessions.set(page, cdp);
  }
  // Chromium refuses a second override until the first is cleared.
  await cdp.send("Emulation.setTimezoneOverride", { timezoneId: "" });
  if (timeZone) {
    await cdp.send("Emulation.setTimezoneOverride", { timezoneId: timeZone });
  }
};

/**
 * Renders a component on the server, as SvelteKit would for a page, and
 * returns its body HTML. `path` is the component's file from the package
 * root (`/src/lib/Time/Time.svelte`); `props` must survive JSON.
 */
export const serverRender: BrowserCommand<
  [path: string, props: Record<string, unknown>]
> = async (context, path, props) => {
  const vite = context.project.vite;
  const { render } = await vite.ssrLoadModule("svelte/server");
  const { default: component } = await vite.ssrLoadModule(path);
  return render(component, { props }).body;
};

/** A cookie as the browser stored it, attributes included. */
export type StoredCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  /** Seconds since the epoch; -1 for a session cookie. */
  expires: number;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
};

/** Every cookie the browser holds. */
export const storedCookies: BrowserCommand<[]> = async (context) =>
  playwrightPage(context, "storedCookies").context().cookies();

declare module "vitest/browser" {
  interface BrowserCommands {
    emulateColorScheme: (scheme: DeviceScheme) => Promise<void>;
    emulateReducedMotion: (
      motion: "reduce" | "no-preference" | null,
    ) => Promise<void>;
    emulateTimeZone: (timeZone: string | null) => Promise<void>;
    serverRender: (
      path: string,
      props: Record<string, unknown>,
    ) => Promise<string>;
    storedCookies: () => Promise<StoredCookie[]>;
  }
}
