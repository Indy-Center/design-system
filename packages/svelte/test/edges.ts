// Checks of where a panel sits against its button, within the 1px that
// browsers round boxes to differently.
import { expect } from "vitest";

/** Expects `edge` within 1px of `target`. */
export function expectAt(edge: number, target: number, what?: string) {
  expect(edge, what).toBeGreaterThanOrEqual(target - 1);
  expect(edge, what).toBeLessThanOrEqual(target + 1);
}

/** Expects `upper`'s bottom at or above `lower`'s top, within 1px. */
export function expectAbove(upper: DOMRect, lower: DOMRect, what?: string) {
  expect(upper.bottom, what).toBeLessThanOrEqual(lower.top + 1);
}

/** Expects `box` inside the window, within 1px. */
export function expectInWindow(box: DOMRect, what?: string) {
  expect(box.left, what).toBeGreaterThanOrEqual(-1);
  expect(box.top, what).toBeGreaterThanOrEqual(-1);
  expect(box.right, what).toBeLessThanOrEqual(innerWidth + 1);
  expect(box.bottom, what).toBeLessThanOrEqual(innerHeight + 1);
}
