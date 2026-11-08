// Checks of where a panel sits against its button, within the 1px that
// browsers round boxes to differently.
import { expect } from "vitest";

/** Expects `edge` within 1px of `target`. */
export function expectAt(edge: number, target: number) {
  expect(edge).toBeGreaterThanOrEqual(target - 1);
  expect(edge).toBeLessThanOrEqual(target + 1);
}

/** Expects `upper`'s bottom at or above `lower`'s top, within 1px. */
export function expectAbove(upper: DOMRect, lower: DOMRect) {
  expect(upper.bottom).toBeLessThanOrEqual(lower.top + 1);
}

/** Expects `box` inside the window, within 1px. */
export function expectInWindow(box: DOMRect) {
  expect(box.left).toBeGreaterThanOrEqual(-1);
  expect(box.top).toBeGreaterThanOrEqual(-1);
  expect(box.right).toBeLessThanOrEqual(innerWidth + 1);
  expect(box.bottom).toBeLessThanOrEqual(innerHeight + 1);
}
