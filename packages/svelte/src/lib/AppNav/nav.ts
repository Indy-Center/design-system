// An app's navigation, and which of its pages is current: shared by
// AppNav (the header bar) and AppNavMenu (the phone menu).
import { withoutTrailingSlash } from "../headerMenu/withoutTrailingSlash.js";

/** A page in the app's navigation. */
export type NavLink = {
  /** Its name. */
  label: string;
  /** Where it goes. */
  href: string;
  /** An MDI path, such as `mdiCalendar` from `@mdi/js`. */
  icon?: string;
};

/** A group of pages, shown from a button. Never a group in a group. */
export type NavGroup = {
  /** Its name, on the button. */
  label: string;
  /** Its pages, in order. */
  children: NavLink[];
  /** An MDI path, such as `mdiHeadset` from `@mdi/js`. */
  icon?: string;
};

/** A top-level item: a page, or a group of pages. */
export type NavItem = NavLink | NavGroup;

export const isGroup = (item: NavItem): item is NavGroup => "children" in item;

/**
 * `path` is `href`'s page, or a page under it ("/" only itself). A
 * trailing slash on either doesn't count.
 */
function isAtOrUnder(path: string, href: string) {
  const page = withoutTrailingSlash(path);
  const link = withoutTrailingSlash(href);
  return page === link || (link !== "/" && page.startsWith(`${link}/`));
}

/**
 * The href of the link that marks `path` as current: the closest of those
 * it is, or is under. None when `path` is left out or matches none.
 */
export function findCurrentHref(items: NavItem[], path: string | undefined) {
  if (path === undefined) return undefined;
  return items
    .flatMap((item) => (isGroup(item) ? item.children : [item]))
    .map((link) => link.href)
    .filter((href) => isAtOrUnder(path, href))
    .sort((a, b) => b.length - a.length)[0];
}

/** `group` holds the link `currentHref` names. */
export const holdsCurrent = (group: NavGroup, currentHref?: string) =>
  group.children.some((link) => link.href === currentHref);
