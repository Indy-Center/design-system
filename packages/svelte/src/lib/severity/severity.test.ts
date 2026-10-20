import { describe, expect, test } from "vitest";
import { SEVERITIES, type Severity } from "./severity.ts";

describe("the severity scale", () => {
  test("runs from least to most important", () => {
    expect(Object.keys(SEVERITIES)).toEqual([
      "info",
      "success",
      "caution",
      "danger",
    ]);
  });

  // From the component list's severity scale.
  test.each([
    ["info", "Info", "info"],
    ["success", "Success", "success"],
    ["caution", "Caution", "warning"],
    ["danger", "Danger", "destructive"],
  ] as [Severity, string, string][])(
    "%s is spoken as %s and uses the %s role",
    (level, label, role) => {
      expect(SEVERITIES[level].label).toBe(label);
      expect(SEVERITIES[level].role).toBe(role);
    },
  );

  test("gives each level its own icon", () => {
    const icons = Object.values(SEVERITIES).map((s) => s.icon);
    expect(new Set(icons).size).toBe(4);
  });
});
