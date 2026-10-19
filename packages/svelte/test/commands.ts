// Browser commands: run in Node, called from tests through
// `commands` in "vitest/browser".
import type { BrowserCommand } from "vitest/node";

type DeviceScheme = "light" | "dark" | "no-preference" | null;

/** Sets the device's colour scheme the page sees; null resets it. */
export const emulateColorScheme: BrowserCommand<[DeviceScheme]> = async (
  context,
  colorScheme,
) => {
  if (context.provider.name !== "playwright") {
    throw new Error("emulateColorScheme needs the Playwright provider");
  }
  await context.page.emulateMedia({ colorScheme });
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
export const storedCookies: BrowserCommand<[]> = async (context) => {
  if (context.provider.name !== "playwright") {
    throw new Error("storedCookies needs the Playwright provider");
  }
  return context.page.context().cookies();
};

declare module "vitest/browser" {
  interface BrowserCommands {
    emulateColorScheme: (scheme: DeviceScheme) => Promise<void>;
    storedCookies: () => Promise<StoredCookie[]>;
  }
}
