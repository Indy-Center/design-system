// Class recipes shared by the header's menus (AppsMenu, AppNav,
// AppNavMenu, UserMenu). Not exported from the package.

/** Every header control and menu row: 44px at least, small medium text. */
const target = "min-h-11 min-w-11 rounded-lg px-3 text-sm font-medium";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * A link in the header or its menus: the link colour, underlined on hover
 * (the user's rule for header links).
 */
const link = [
  target,
  "text-link underline-offset-4 hover:underline",
  focusRing,
];

/**
 * Added to a link that is the current page, or a group or app holding it:
 * the soft fill, and underlined.
 */
export const currentClass = "bg-foreground/10 underline";

/** A link or group button in the header bar: inline, content centred. */
export const barItem = [
  ...link,
  "inline-flex items-center justify-center gap-2",
];

/** A row in a menu's panel or the phone menu: full width. */
export const menuRow = [...link, "flex w-full items-center gap-3"];

/** A button in the header that isn't a link, such as Apps. */
export const headerButton = [
  target,
  "inline-flex items-center justify-center gap-2",
  "text-foreground-soft hover:bg-foreground/10 hover:text-foreground",
];
