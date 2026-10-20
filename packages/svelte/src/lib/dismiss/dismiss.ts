import type { Action } from "svelte/action";

export type DismissOptions = {
  /** Whether the panel is showing. Nothing happens while it isn't. */
  open: boolean;
  /**
   * What shows the panel: its button, or a combobox's input (from
   * `bind:this` on a `$state`). A
   * press on it isn't outside, so its own click can toggle; Escape puts
   * focus back on it.
   */
  trigger: HTMLElement | undefined;
  /** Closes the panel: set the component's `open` to false. */
  onclose: () => void;
};

/**
 * While a disclosure's panel is open, closes it on Escape and on a pointer
 * press outside the panel and its trigger. Escape puts focus back on the
 * trigger, unless focus was elsewhere on the page.
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

  function onkeydown(event: KeyboardEvent) {
    if (event.key !== "Escape") return;
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
    const path = event.composedPath();
    if (path.includes(panel)) return;
    if (options.trigger && path.includes(options.trigger)) return;
    options.onclose();
  }

  function listen(on: boolean) {
    if (on === listening) return;
    listening = on;
    // Capture, so a handler that stops the press doesn't keep it open.
    if (on) {
      document.addEventListener("keydown", onkeydown);
      document.addEventListener("pointerdown", onpointerdown, true);
    } else {
      document.removeEventListener("keydown", onkeydown);
      document.removeEventListener("pointerdown", onpointerdown, true);
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
