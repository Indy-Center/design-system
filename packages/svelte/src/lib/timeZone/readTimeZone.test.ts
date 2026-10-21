import { describe, expect, test } from "vitest";
import { readTimeZone } from "./timeZone.ts";
import { COOKIE_NAME } from "./timeZone.ts";

/** A request's cookies, as SvelteKit's `cookies.get` reads them. */
function cookies(value?: string) {
  return { get: (name: string) => (name === COOKIE_NAME ? value : undefined) };
}

describe("reading the time-zone cookie on the server", () => {
  test("with none, nothing is saved", () => {
    expect(readTimeZone(cookies())).toBeUndefined();
  });

  test("zulu is the Zulu choice", () => {
    expect(readTimeZone(cookies("zulu"))).toEqual({ kind: "zulu" });
  });

  test("a zone name is that zone", () => {
    expect(readTimeZone(cookies("America/Chicago"))).toEqual({
      kind: "zone",
      zone: "America/Chicago",
    });
  });

  test("device:<zone> follows the device, last seen in that zone", () => {
    expect(readTimeZone(cookies("device:Europe/London"))).toEqual({
      kind: "device",
      zone: "Europe/London",
    });
  });

  test.each([
    "Mars/Olympus_Mons",
    "device:Mars/Olympus_Mons",
    "device:",
    "local",
    "America/Chicago<script>",
    "+01:00",
    `America/${"A".repeat(80)}`,
  ])("%s is not a time zone, so counts as none", (value) => {
    expect(readTimeZone(cookies(value))).toBeUndefined();
  });

  test("another name for a listed zone is accepted", () => {
    // Browsers and servers disagree on which of a zone's names is listed.
    expect(readTimeZone(cookies("Asia/Kolkata"))).toEqual({
      kind: "zone",
      zone: "Asia/Kolkata",
    });
    expect(readTimeZone(cookies("Asia/Calcutta"))).toEqual({
      kind: "zone",
      zone: "Asia/Calcutta",
    });
  });
});

describe("with the member's profile setting", () => {
  test("a zone on the profile wins over the cookie", () => {
    expect(
      readTimeZone(cookies("zulu"), { profile: "America/New_York" }),
    ).toEqual({ kind: "zone", zone: "America/New_York" });
  });

  test("zulu on the profile wins over the cookie", () => {
    expect(
      readTimeZone(cookies("America/Chicago"), { profile: "zulu" }),
    ).toEqual({ kind: "zulu" });
  });

  test("device on the profile takes the zone this browser last saw", () => {
    expect(
      readTimeZone(cookies("device:America/Denver"), { profile: "device" }),
    ).toEqual({ kind: "device", zone: "America/Denver" });
  });

  test("device on the profile, with no zone seen on this browser yet", () => {
    expect(
      readTimeZone(cookies("America/Denver"), { profile: "device" }),
    ).toEqual({ kind: "device" });
  });

  test("no setting, or one that isn't valid, leaves the cookie's", () => {
    expect(readTimeZone(cookies("zulu"), { profile: undefined })).toEqual({
      kind: "zulu",
    });
    expect(readTimeZone(cookies("zulu"), { profile: "Nowhere" })).toEqual({
      kind: "zulu",
    });
  });
});
