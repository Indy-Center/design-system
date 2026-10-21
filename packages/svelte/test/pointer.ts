import { userEvent } from "vitest/browser";

let corner: HTMLElement | undefined;
// Whether the pointer is still where `movePointerAway` left it.
let away = false;

if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (event) => (away = !!corner && event.target === corner),
    { capture: true },
  );
}

/**
 * Moves the pointer to the page's bottom-left corner, off anything a test
 * renders, so a hover one test (or file) leaves doesn't show in the next.
 * Does nothing when no click or hover has moved it since.
 */
export async function movePointerAway() {
  if (away) return;
  corner = document.createElement("div");
  corner.style.cssText =
    "position: fixed; left: 0; bottom: 0; width: 8px; height: 8px";
  document.body.append(corner);
  try {
    await userEvent.hover(corner);
    away = true;
  } finally {
    corner.remove();
    corner = undefined;
  }
}
