import { COOKIE_NAME, type ColorScheme } from "./colorScheme.js";

export type SaveColorSchemeOptions = {
  /**
   * The domain the cookie is shared across. On a page outside it (such as
   * localhost) the cookie is kept for the page's own host instead.
   */
  domain?: string;
};

/** The Indy Center domain, which every app's cookie is shared across. */
const INDY_CENTER_DOMAIN = "flyindycenter.com";

const ONE_YEAR = 365 * 24 * 60 * 60;

/**
 * Saves the member's explicit choice to the shared cookie and applies it to
 * the page at once. In the browser only; for the user menu's colour-scheme
 * item. Never call it with the device's setting.
 */
export function saveColorScheme(
  scheme: ColorScheme,
  { domain = INDY_CENTER_DOMAIN }: SaveColorSchemeOptions = {},
): void {
  const host = location.hostname;
  const onDomain = host === domain || host.endsWith(`.${domain}`);
  document.cookie = [
    `${COOKIE_NAME}=${scheme}`,
    "Path=/",
    `Max-Age=${ONE_YEAR}`,
    "SameSite=Lax",
    ...(onDomain ? [`Domain=${domain}`] : []),
    ...(location.protocol === "https:" ? ["Secure"] : []),
  ].join("; ");
  document.documentElement.dataset.theme = scheme;
}
