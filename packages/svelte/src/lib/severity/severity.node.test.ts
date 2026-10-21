import { describe, expect, test } from "vitest";
import { SEVERITIES, type Severity } from "./severity.ts";

describe("the severity scale", () => {
  test("runs from least to most important, listed in that order", () => {
    const levels = Object.keys(SEVERITIES) as Severity[];
    expect(levels).toEqual(["info", "success", "caution", "danger"]);
    expect(levels.map((l) => SEVERITIES[l].rank)).toEqual([0, 1, 2, 3]);
  });

  // From the component list's severity scale.
  test.each([
    ["info", "Info", "info", "status"],
    ["success", "Success", "success", "status"],
    ["caution", "Caution", "warning", "status"],
    ["danger", "Danger", "destructive", "alert"],
  ] as [Severity, string, string, string][])(
    "%s is spoken as %s, uses the %s role and is announced as %s",
    (level, label, role, live) => {
      expect(SEVERITIES[level].label).toBe(label);
      expect(SEVERITIES[level].role).toBe(role);
      expect(SEVERITIES[level].live).toBe(live);
    },
  );

  test("gives each level its own icon", () => {
    const icons = Object.values(SEVERITIES).map((s) => s.icon);
    expect(new Set(icons).size).toBe(4);
  });
});
