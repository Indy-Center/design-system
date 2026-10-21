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

// One DevTools session per page, kept for the next override.
const sessions = new WeakMap<Page, CDPSession>();

/** Sets the time zone the page's clock reads, an IANA name; null resets it. */
export const emulateTimeZone: BrowserCommand<[string | null]> = async (
  context,
  timeZone,
) => {
  const page = playwrightPage(context, "emulateTimeZone");
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
