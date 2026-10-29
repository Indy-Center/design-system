import { describe, expect, test } from "vitest";
import { logoffFromInfo } from "./logoff.ts";

// Logged in at 2051Z on 20 October 2026.
const loggedIn = new Date("2026-10-20T20:51:00Z");

describe("logoffFromInfo", () => {
  test.each([
    ["Expected log-off time: 2330z", "2026-10-20T23:30:00.000Z"],
    ["Off around 2330Z", "2026-10-20T23:30:00.000Z"],
    ["Indy Center.\nOnline until 2200Z.", "2026-10-20T22:00:00.000Z"],
  ])("reads %j as that time the same day", (info, at) => {
    expect(logoffFromInfo(info, loggedIn)?.toISOString()).toBe(at);
  });

  test("takes a time before the log-in as the next day's", () => {
    expect(
      logoffFromInfo("Training session until 0130Z", loggedIn)?.toISOString(),
    ).toBe("2026-10-21T01:30:00.000Z");
  });

  test("takes the log-in's own minute as that minute", () => {
    expect(logoffFromInfo("Until 2051Z", loggedIn)?.toISOString()).toBe(
      "2026-10-20T20:51:00.000Z",
    );
  });

  test("takes the log-in's own minute as that minute, seconds after it", () => {
    expect(
      logoffFromInfo("Until 2051Z", "2026-10-20T20:51:30Z")?.toISOString(),
    ).toBe("2026-10-20T20:51:00.000Z");
  });

  test("takes the first time", () => {
    expect(
      logoffFromInfo("Until 2300Z, maybe 0000Z", loggedIn)?.toISOString(),
    ).toBe("2026-10-20T23:00:00.000Z");
  });

  test("passes over a time that isn't one for a real one after it", () => {
    expect(logoffFromInfo("Not 2460Z but 2300Z", loggedIn)?.toISOString()).toBe(
      "2026-10-20T23:00:00.000Z",
    );
  });

  test("reads VATSIM's lines of controller info", () => {
    expect(
      logoffFromInfo(["Indy Center", "Off at 2330z"], loggedIn)?.toISOString(),
    ).toBe("2026-10-20T23:30:00.000Z");
  });

  test("takes the log-in time as an ISO string or milliseconds", () => {
    expect(logoffFromInfo("2330Z", "2026-10-20T20:51:00Z")?.toISOString()).toBe(
      "2026-10-20T23:30:00.000Z",
    );
    expect(logoffFromInfo("2330Z", loggedIn.getTime())?.toISOString()).toBe(
      "2026-10-20T23:30:00.000Z",
    );
  });

  test.each([
    // Hours past 23, minutes past 59.
    "Closing at 2460Z",
    "Closing at 2400Z",
    "Closing at 2361Z",
    // Not four digits.
    "Closing at 930Z",
    "Closing at 12300Z",
    // No Z: a runway, a frequency, a local time.
    "Runway 23 in use, ATIS on 128.82",
    "Freq 132.050",
    "Until 2330",
    "Until 7:30 PM",
    // Inside a word.
    "Ref A2330Z",
    "",
  ])("finds no time in %j", (info) => {
    expect(logoffFromInfo(info, loggedIn)).toBeUndefined();
  });

  test.each([null, undefined, []])("finds no time in %j", (info) => {
    expect(logoffFromInfo(info, loggedIn)).toBeUndefined();
  });

  test("gives none for a log-in time that isn't a date", () => {
    expect(logoffFromInfo("2330Z", "soon")).toBeUndefined();
  });
});
