// Class recipes shared by the header's menus (AppsMenu, AppNav,
// AppNavMenu, UserMenu), and the two ways HeaderMenu and Header's phone
// menu close beyond `dismiss`. Not exported from the package.

/**
 * A menu panel's click handler: following one of its links closes it, as
 * the page changes. A Ctrl-, Cmd- or Shift-click opens the link elsewhere
 * and leaves this page, so the menu stays.
 */
export function closeOnLink(close: () => void) {
  return (event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey) return;
    if ((event.target as Element).closest("a[href]")) close();
  };
}

/**
 * A focusout handler on what holds a menu: Tabbing out of it closes the
 * menu, so a keyboard user moving on doesn't leave it showing. Focus going
 * nowhere (a click on a panel's text) isn't leaving, nor is focus going to
 * `trigger`, the menu's button when it sits outside the holder.
 */
export function closeOnFocusOut(
  close: () => void,
  trigger?: () => Node | undefined,
) {
  return (event: FocusEvent) => {
    const to = event.relatedTarget as Node | null;
    if (!to || to === trigger?.()) return;
    if (!(event.currentTarget as Element).contains(to)) close();
  };
}

/** Every header control and menu row: 44px at least, small medium text. */
const target = "min-h-11 min-w-11 rounded-lg px-3 text-sm font-medium";

/** The ring outline on whatever is reached by keyboard: every recipe here has it. */
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

/**
 * A link in the header or its menus, without its colour: underlined on
 * hover (the user's rule for header links).
 */
const underlined = [target, "underline-offset-4 hover:underline", focusRing];

/** A link in the header or its menus: the link colour, underlined on hover. */
const link = [...underlined, "text-link"];

/** A menu row's layout: full width, icon then text. */
const row = "flex w-full items-center gap-3";

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
export const menuRow = [...link, row];

/**
 * UserMenu's Sign out row: a menu row in the destructive colour, so it
 * stands apart from the links that stay in the app. Only UserMenu uses
 * it, so its tests cover it; it lives here for the recipes it shares.
 */
export const signOutRow = [...underlined, row, "text-destructive"];

/** A button in the header that isn't a link, such as Apps. */
export const headerButton = [
  target,
  "inline-flex items-center justify-center gap-2",
  "text-foreground-soft hover:bg-foreground/10 hover:text-foreground",
  focusRing,
];
