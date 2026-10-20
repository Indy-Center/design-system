// Browser commands: run in Node, called from tests through
// `commands` in "vitest/browser".
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
    storedCookies: () => Promise<StoredCookie[]>;
  }
}
