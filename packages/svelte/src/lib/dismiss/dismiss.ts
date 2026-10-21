import type { Action } from "svelte/action";

export type DismissOptions = {
  /** Whether the panel is showing. Nothing happens while it isn't. */
  open: boolean;
  /**
   * What shows the panel: its button, or a combobox's input (from
   * `bind:this` on a `$state`). A press on it isn't outside, so its own
   * click can toggle; Escape puts focus back on it.
   */
  trigger: HTMLElement | undefined;
  /** Closes the panel: set the component's `open` to false. */
  onclose: () => void;
};

// How far a press can move, in CSS pixels, and still count as a tap: a
// finger wobbles a little. Further is a scroll or a drag.
const TAP_SLOP = 10;

// The open panels' Escape handlers, in the order they opened. One Escape
// goes to the last: a tooltip inside an open menu opened after it, so it
// closes first and the menu waits for a second Escape.
const escapes: ((event: KeyboardEvent) => void)[] = [];

function onkeydown(event: KeyboardEvent) {
  // While composing, Escape cancels the input method's text.
  if (event.key !== "Escape" || event.isComposing) return;
  escapes.at(-1)?.(event);
}

/**
 * While a disclosure's panel is open, closes it on Escape and on a tap
 * outside the panel and its trigger. Escape closes only the innermost
 * open panel (the last to open) and puts focus back on its trigger,
 * unless focus was elsewhere on the page. A press outside that moves (a
 * scroll or a drag) leaves the panel open.
 *
 * Goes on the panel: `use:dismiss={{ open, trigger, onclose }}`. For the
 * package's own components; not exported from the package.
 */
export const dismiss: Action<HTMLElement, DismissOptions> = (
  panel,
  initial,
) => {
  let options = initial;
  let listening = false;
  // A press that started outside, until it lifts or is cancelled.
  let press: { id: number; x: number; y: number } | undefined;

  function onescape(event: KeyboardEvent) {
    // This Escape is the panel's, so a dialog it sits in stays open.
    event.preventDefault();
    // Focus in the panel would be lost when it hides. Focus elsewhere on
    // the page (a tooltip shown on hover) stays where it is.
    const focus = document.activeElement;
    const returnFocus =
      !focus ||
      focus === document.body ||
      panel.contains(focus) ||
      focus === options.trigger;
    options.onclose();
    if (returnFocus) options.trigger?.focus();
  }

  function onpointerdown(event: PointerEvent) {
    press = undefined;
    const path = event.composedPath();
    if (path.includes(panel)) return;
    if (options.trigger && path.includes(options.trigger)) return;
    press = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  // Closes on the lift, once the press is known to be a tap.
  function onpointerup(event: PointerEvent) {
    if (!press || event.pointerId !== press.id) return;
    const moved = Math.hypot(event.clientX - press.x, event.clientY - press.y);
    press = undefined;
    if (moved <= TAP_SLOP) options.onclose();
  }

  // The browser cancels a touch it takes over to scroll or zoom.
  function onpointercancel(event: PointerEvent) {
    if (press && event.pointerId === press.id) press = undefined;
  }

  function listen(on: boolean) {
    if (on === listening) return;
    listening = on;
    // Capture, so a handler that stops the press doesn't keep it open.
    if (on) {
      escapes.push(onescape);
      if (escapes.length === 1) document.addEventListener("keydown", onkeydown);
      document.addEventListener("pointerdown", onpointerdown, true);
      document.addEventListener("pointerup", onpointerup, true);
      document.addEventListener("pointercancel", onpointercancel, true);
    } else {
      escapes.splice(escapes.indexOf(onescape), 1);
      if (escapes.length === 0)
        document.removeEventListener("keydown", onkeydown);
      document.removeEventListener("pointerdown", onpointerdown, true);
      document.removeEventListener("pointerup", onpointerup, true);
      document.removeEventListener("pointercancel", onpointercancel, true);
      press = undefined;
    }
  }

  listen(options.open);
  return {
    update(next) {
      options = next;
      listen(options.open);
    },
    destroy() {
      listen(false);
    },
  };
};
