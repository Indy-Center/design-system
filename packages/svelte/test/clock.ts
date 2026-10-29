// The pinned clock and device zone the time components' tests share.
import { afterEach, beforeEach, vi } from "vitest";
import { commands } from "vitest/browser";

/** 2100Z on Tuesday 20 October 2026: 5:00 PM in Indianapolis (EDT, UTC−4). */
export const NOW = new Date("2026-10-20T21:00:00Z");

/** The device's zone in these tests. */
export const INDY = "America/Indiana/Indianapolis";

/**
 * Before each test in the file, pins the date at `NOW` and puts the device
 * in Indianapolis; after it, puts both back. Only the date is faked, and it
 * keeps moving: expect.element times its retries by it.
 */
export function pinClockInIndianapolis() {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"], shouldAdvanceTime: true });
    vi.setSystemTime(NOW);
    await commands.emulateTimeZone(INDY);
  });

  afterEach(async () => {
    vi.useRealTimers();
    await commands.emulateTimeZone(null);
  });
}
