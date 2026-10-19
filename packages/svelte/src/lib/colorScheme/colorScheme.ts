/** Light or dark: a member's explicit choice. */
export type ColorScheme = "light" | "dark";

/**
 * The cookie every Indy Center app shares. It only ever holds an explicit
 * choice, never the device's setting.
 */
export const COOKIE_NAME = "indy-color-scheme";

/** The choice `value` holds, or undefined when it holds none. */
export function parseColorScheme(
  value: string | undefined,
): ColorScheme | undefined {
  return value === "light" || value === "dark" ? value : undefined;
}
