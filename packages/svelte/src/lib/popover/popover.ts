import type { Action } from "svelte/action";

export type PopoverOptions = {
  /** Whether the panel is showing. */
  open: boolean;
  /**
   * What the panel is placed against: its button, or the box round a
   * tooltip's trigger (from `bind:this` on a `$state`).
   */
  anchor: HTMLElement | undefined;
  /** Where the panel goes against the anchor, as CSS `position-area`: `"top"`, `"bottom span-left"`. */
  area: string;
  /**
   * Where else it may go when that would leave the window, as CSS
   * `position-try-fallbacks`: `"flip-block"`. None by default.
   */
  fallbacks?: string;
};

// Each panel's anchor gets a name of its own, so two on a page don't mix.
let made = 0;

/**
 * Shows and hides a manual popover as `open` changes, and places it
 * against its anchor with CSS anchor positioning. The browser draws a
 * popover above everything, so a table or a scrolling box can't clip it.
 * Closing it on Escape or a tap outside is `dismiss`'s job; use both.
 *
 * Goes on the panel, which has `popover="manual"` (so the server draws it
 * hidden): `use:popover={{ open, anchor, area, fallbacks }}`. For the
 * package's own components; not exported from the package.
 */
export const popover: Action<HTMLElement, PopoverOptions> = (
  panel,
  initial,
) => {
  const name = `--popover-${++made}`;
  let anchor: HTMLElement | undefined;

  // Tailwind has no utilities for these yet, and the area is the caller's.
  panel.style.setProperty("inset", "auto");
  panel.style.setProperty("position-anchor", name);

  function apply(options: PopoverOptions) {
    if (options.anchor !== anchor) {
      anchor?.style.removeProperty("anchor-name");
      anchor = options.anchor;
      anchor?.style.setProperty("anchor-name", name);
    }
    panel.style.setProperty("position-area", options.area);
    if (options.fallbacks)
      panel.style.setProperty("position-try-fallbacks", options.fallbacks);
    else panel.style.removeProperty("position-try-fallbacks");

    const showing = panel.matches(":popover-open");
    if (options.open && !showing) panel.showPopover();
    if (!options.open && showing) panel.hidePopover();
  }

  apply(initial);
  return {
    update: apply,
    destroy() {
      anchor?.style.removeProperty("anchor-name");
    },
  };
};
