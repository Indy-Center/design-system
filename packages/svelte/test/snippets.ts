// Snippets to pass as a component's `children` or `icon` in tests.
import { createRawSnippet } from "svelte";
import { expect } from "vitest";

/** `s` as a child, in its own span so `getByText` finds it. */
export const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

/** An empty icon, found by `getByTestId("icon")`. */
export const icon = createRawSnippet(() => ({
  render: () => `<svg data-testid="icon" viewBox="0 0 24 24"></svg>`,
}));

/** `svg` comes first in `host` and is hidden from screen readers. */
export function expectLeadingHiddenIcon(host: Element, svg: Element) {
  expect(host.firstElementChild!.contains(svg)).toBe(true);
  expect(svg.closest("[aria-hidden='true']")).not.toBeNull();
}
