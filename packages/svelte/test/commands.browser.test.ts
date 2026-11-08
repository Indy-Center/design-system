import { afterEach, describe, expect, test } from "vitest";
import { commands } from "vitest/browser";

// 2300Z on 20 October 2026.
const AT = new Date("2026-10-20T23:00:00Z");

/** The zone the page's clock reads, as the components ask for it. */
const deviceZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

describe("emulateTimeZone", () => {
  afterEach(() => commands.emulateTimeZone(null));

  test("puts the page's clock in the zone", async () => {
    await commands.emulateTimeZone("Asia/Tokyo");

    expect(deviceZone()).toBe("Asia/Tokyo");
    const time = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "numeric",
    }).format(AT);
    expect(time).toBe("8:00 AM");
  });

  test("moves the clock from one zone to the next", async () => {
    await commands.emulateTimeZone("Asia/Tokyo");
    await commands.emulateTimeZone("Europe/London");

    expect(deviceZone()).toBe("Europe/London");
  });

  test("leaves a zone a format names alone", async () => {
    await commands.emulateTimeZone("Asia/Tokyo");

    const zone = new Intl.DateTimeFormat("en-US", { timeZone: "UTC" });
    expect(zone.resolvedOptions().timeZone).toBe("UTC");
  });

  test("null puts the clock back in the machine's zone", async () => {
    const machine = deviceZone();
    await commands.emulateTimeZone("Asia/Tokyo");

    await commands.emulateTimeZone(null);

    expect(deviceZone()).toBe(machine);
  });
});
