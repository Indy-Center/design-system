/**
 * `url` without a slash at its end, so `/events/` matches `/events` and
 * `https://x/` matches `https://x`, for AppsMenu's and AppNav's current
 * page. "/" stays itself. Not exported from the package.
 */
export function withoutTrailingSlash(url: string) {
  return url.replace(/\/+$/, "") || (url && "/");
}
