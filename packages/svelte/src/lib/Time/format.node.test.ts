import { describe, expect, test } from "vitest";
import { timeText, type TimeShown, type TimeZoneShown } from "./format.ts";

// 2100Z on Tuesday 20 October 2026: 5:00 PM in Indianapolis (EDT, UTC−4).
const NOW = new Date("2026-10-20T21:00:00Z");
const INDY = "America/Indiana/Indianapolis";

type Case = {
  value: string;
  end?: string;
  show?: TimeShown;
  zone?: TimeZoneShown;
  /** The member's zone; null for one not known yet (on the server). */
  member?: string | null;
};

/** `timeText`'s pieces as one line, as `Time` draws them. */
function text({ value, end, show = "time", zone = "local", member }: Case) {
  return timeText({
    start: new Date(value),
    end: end === undefined ? undefined : new Date(end),
    show,
    zone,
    memberZone: member === null ? undefined : (member ?? INDY),
    now: () => NOW,
  })
    .map((piece) => piece.text)
    .join("");
}

const event = {
  value: "2026-10-20T23:00:00Z",
  end: "2026-10-21T02:00:00Z",
  show: "datetime",
  zone: "both",
} as const;

describe("timeText", () => {
  test.each<[string, Case, string]>([
    // Zones.
    ["local", { value: "2026-10-20T23:00:00Z" }, "7:00 PM EDT"],
    [
      "both: Zulu after local",
      { value: "2026-10-20T23:00:00Z", zone: "both" },
      "7:00 PM EDT · 2300Z",
    ],
    ["Zulu", { value: "2026-10-20T23:00:00Z", zone: "zulu" }, "2300Z"],
    [
      "a zone with no abbreviation in en-US, by its offset",
      { value: "2026-10-20T23:00:00Z", member: "Europe/London" },
      "12:00 AM GMT+1",
    ],
    // With the date.
    [
      "Today for today",
      { value: "2026-10-20T23:00:00Z", show: "datetime" },
      "Today, 7:00 PM EDT",
    ],
    [
      // 0200Z on the 21st is still the 20th in Indianapolis.
      "the day in the member's zone, not Zulu's",
      { value: "2026-10-21T02:00:00Z", show: "datetime" },
      "Today, 10:00 PM EDT",
    ],
    [
      "Tomorrow for tomorrow",
      { value: "2026-10-21T23:00:00Z", show: "datetime" },
      "Tomorrow, 7:00 PM EDT",
    ],
    [
      "the weekday within the coming week",
      { value: "2026-10-22T23:00:00Z", show: "datetime" },
      "Thursday, 7:00 PM EDT",
    ],
    [
      "the weekday at the end of the coming week",
      { value: "2026-10-26T23:00:00Z", show: "datetime" },
      "Monday, 7:00 PM EDT",
    ],
    [
      "the day before the month from a week out",
      { value: "2026-10-27T23:00:00Z", show: "datetime" },
      "Tue 27 Oct, 7:00 PM EDT",
    ],
    [
      "the day before the month for a day gone by",
      { value: "2026-10-19T23:00:00Z", show: "datetime" },
      "Mon 19 Oct, 7:00 PM EDT",
    ],
    [
      "the year when it isn't this year",
      { value: "2027-03-04T23:00:00Z", show: "datetime" },
      "Thu 4 Mar 2027, 6:00 PM EST",
    ],
    // A range.
    [
      "a range shares the day and the zone between its ends",
      event,
      "Today, 7:00 PM–10:00 PM EDT · 2300Z–0200Z",
    ],
    [
      "a range names the end's day when it ends on another",
      { ...event, end: "2026-10-21T05:00:00Z" },
      "Today, 7:00 PM–Tomorrow, 1:00 AM EDT · 2300Z–0500Z",
    ],
    [
      // Daylight saving ends at 2:00 AM on Sunday 1 November.
      "a range names each end's zone when the clocks change between them",
      { value: "2026-10-31T23:00:00Z", end: "2026-11-01T07:00:00Z" },
      "7:00 PM EDT–2:00 AM EST",
    ],
    [
      "a range in Zulu takes its days from Zulu",
      { ...event, zone: "zulu" },
      "Today, 2300Z–Tomorrow, 0200Z",
    ],
    [
      "a range gone by puts the day before the month",
      {
        ...event,
        value: "2026-10-19T23:00:00Z",
        end: "2026-10-20T01:00:00Z",
        zone: "local",
      },
      "Mon 19 Oct, 7:00 PM–9:00 PM EDT",
    ],
    // Relative.
    [
      "in, before a time to come, in short units",
      { value: "2026-10-20T23:00:00Z", show: "relative" },
      "in 2 h",
    ],
    [
      "a bare length for a time gone by, for the caller to label",
      { value: "2026-10-20T19:37:00Z", show: "relative" },
      "1 h 23 m",
    ],
    [
      "0 m the minute it happens",
      { value: NOW.toISOString(), show: "relative" },
      "0 m",
    ],
    // The member's zone not known yet (on the server): Zulu, whose "Today"
    // can be another day for the member, so the date is written out.
    [
      "unknown zone: local in Zulu",
      { value: "2026-10-20T23:00:00Z", member: null },
      "2300Z",
    ],
    [
      "unknown zone: the date written out, not Today",
      { value: "2026-10-20T23:00:00Z", show: "datetime", member: null },
      "Tue 20 Oct, 2300Z",
    ],
    [
      "unknown zone: both is Zulu alone",
      { ...event, member: null },
      "Tue 20 Oct, 2300Z–Wed 21 Oct, 0200Z",
    ],
    [
      "unknown zone: Today kept when Zulu is asked for",
      {
        value: "2026-10-20T23:00:00Z",
        show: "datetime",
        zone: "zulu",
        member: null,
      },
      "Today, 2300Z",
    ],
  ])("%s", (_, options, expected) => {
    expect(text(options)).toBe(expected);
  });

  test("marks each end of a range with its instant", () => {
    const pieces = timeText({
      start: new Date(event.value),
      end: new Date(event.end),
      show: "datetime",
      zone: "both",
      memberZone: INDY,
      now: () => NOW,
    });
    expect(pieces.map((p) => [p.at?.toISOString(), p.text])).toEqual([
      ["2026-10-20T23:00:00.000Z", "Today, 7:00 PM"],
      [undefined, "–"],
      ["2026-10-21T02:00:00.000Z", "10:00 PM EDT"],
      [undefined, " · "],
      ["2026-10-20T23:00:00.000Z", "2300Z"],
      [undefined, "–"],
      ["2026-10-21T02:00:00.000Z", "0200Z"],
    ]);
  });

  test("gives no pieces for an invalid start, and leaves off an invalid end", () => {
    const options = {
      show: "time",
      zone: "local",
      memberZone: INDY,
      now: () => NOW,
    } as const;
    expect(timeText({ ...options, start: new Date("soon") })).toEqual([]);
    expect(
      timeText({
        ...options,
        start: new Date("2026-10-20T23:00:00Z"),
        end: new Date("later"),
      }).map((p) => p.text),
    ).toEqual(["7:00 PM EDT"]);
  });
});
