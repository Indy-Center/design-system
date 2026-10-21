import { describe, expect, test } from "vitest";
import { findCurrentHref, holdsCurrent, isGroup, type NavItem } from "./nav.ts";

const items: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Teach", href: "/teach/" },
  {
    label: "About",
    children: [
      { label: "Staff", href: "/staff" },
      { label: "Sessions", href: "/teach/sessions" },
    ],
  },
];

describe("findCurrentHref", () => {
  test.each([
    ["the page itself", "/events", "/events"],
    ["a page under it", "/events/42", "/events"],
    ["a trailing slash on the path", "/events/", "/events"],
    ["a trailing slash on the link", "/teach", "/teach/"],
    ["a link in a group", "/staff/7", "/staff"],
    [
      "the closest of two, one under the other",
      "/teach/sessions/7",
      "/teach/sessions",
    ],
    ["the outer of two, above the inner", "/teach/students", "/teach/"],
    ["home on the home page", "/", "/"],
    ["home only on itself", "/admin", undefined],
    ["not a page sharing only the start", "/eventsarchive", undefined],
    ["none for no path", undefined, undefined],
  ] as const)("%s: %j is %j", (_, path, expected) => {
    expect(findCurrentHref(items, path)).toBe(expected);
  });
});

describe("holdsCurrent and isGroup", () => {
  const about = items[3];

  test("isGroup tells a group from a link", () => {
    expect(items.map(isGroup)).toEqual([false, false, false, true]);
  });

  test.each([
    ["/staff", true],
    ["/teach/sessions", true],
    ["/events", false],
    [undefined, false],
  ] as const)("a group holds %j: %j", (href, expected) => {
    if (!isGroup(about)) throw new Error("About is a group");
    expect(holdsCurrent(about, href)).toBe(expected);
  });
});
