// How the reference site names a doc page: shared by the Markdown plugin
// (in Node, at build) and the site's own pages.

/** The site's address, for the absolute links in llms.txt and llms-full.txt. */
export const SITE = "https://centerline.flyindycenter.com";

/** Where links to the repo's other files go: its files on `main`. */
export const REPO = "https://github.com/Indy-Center/design-system/blob/main";

/** `TimeZoneLine` or `colorScheme` as a route folder: `time-zone-line`, `color-scheme`. */
export const kebab = (name: string) =>
  name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** A doc's name (`TimeZoneLine`) or route (`time-zone-line`), compared alike. */
export const docKey = (name: string) => name.replaceAll("-", "").toLowerCase();

/**
 * The page that draws the doc called `name`: its component's page when
 * `routes` (the route folders) has one, else its page under `/helpers/`.
 */
export function docHref(name: string, routes: readonly string[]) {
  const route = routes.find((folder) => docKey(folder) === docKey(name));
  return route ? `/${route}` : `/helpers/${kebab(name)}`;
}
