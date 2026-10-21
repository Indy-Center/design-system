// Class recipes shared by the header's menus (AppsMenu, AppNav, UserMenu).
// Not exported from the package.

/**
 * A link in the header or its menus: the link colour, underlined on hover
 * (the user's rule for header links). 44px at least.
 */
const link = [
  "min-h-11 min-w-11 rounded-lg px-3 text-sm font-medium text-link underline-offset-4 hover:underline",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
];

/**
 * Added to a link that is the current page, or a group or app holding it:
 * the soft fill, and underlined.
 */
export const current = "bg-foreground/10 underline";

/** A link or group button in the header bar: inline, content centred. */
export const barItem = [
  ...link,
  "inline-flex items-center justify-center gap-2",
];

/** A row in a menu's panel or the phone menu: full width. */
export const menuRow = [...link, "flex w-full items-center gap-3"];

/** A button in the header that isn't a link, such as Apps. */
export const headerButton = [
  "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-3",
  "text-sm font-medium text-foreground-soft hover:bg-foreground/10 hover:text-foreground",
];
