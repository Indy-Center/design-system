// The attributes every Indy Center preference cookie shares (the colour
// scheme's and the time zone's), written from the browser.

/** The Indy Center domain, which every app's cookie is shared across. */
export const INDY_CENTER_DOMAIN = "flyindycenter.com";

const ONE_YEAR = 365 * 24 * 60 * 60;

export type PreferenceCookieOptions = {
  /**
   * The domain the cookie is shared across. On a page outside it (such as
   * localhost) the cookie is kept for the page's own host instead.
   */
  domain?: string;
};

/**
 * Writes `name=value` for a year on `Path=/`, `SameSite=Lax`, across
 * `domain` when the page is on it, and `Secure` on https. Readable by the
 * page. In the browser only.
 */
export function writePreferenceCookie(
  name: string,
  value: string,
  options: PreferenceCookieOptions = {},
): void {
  document.cookie = cookie(name, value, ONE_YEAR, options);
}

/** Deletes the cookie `writePreferenceCookie` wrote. In the browser only. */
export function deletePreferenceCookie(
  name: string,
  options: PreferenceCookieOptions = {},
): void {
  document.cookie = cookie(name, "", 0, options);
}

/** The cookie's value as the page reads it, if it has one. */
export function readPreferenceCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((pair) => pair.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function cookie(
  name: string,
  value: string,
  maxAge: number,
  { domain = INDY_CENTER_DOMAIN }: PreferenceCookieOptions,
): string {
  const host = location.hostname;
  const onDomain = host === domain || host.endsWith(`.${domain}`);
  return [
    `${name}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
    ...(onDomain ? [`Domain=${domain}`] : []),
    ...(location.protocol === "https:" ? ["Secure"] : []),
  ].join("; ");
}
