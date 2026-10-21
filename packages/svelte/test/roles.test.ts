import { describe, expect, test } from "vitest";
import { computedColour, role } from "./roles.ts";

describe("computedColour", () => {
  test("writes a hex colour as getComputedStyle does", () => {
    expect(computedColour("#334155")).toBe("rgb(51, 65, 85)");
    expect(computedColour("#0ea5e9")).toBe("rgb(14, 165, 233)");
  });

  test("keeps a see-through hex's alpha, as Chromium rounds it", () => {
    expect(computedColour("#33415580")).toBe("rgba(51, 65, 85, 0.5)");
    expect(computedColour("#0000001a")).toBe("rgba(0, 0, 0, 0.1)");
    expect(computedColour("#00000001")).toBe("rgba(0, 0, 0, 0.004)");
  });

  test("throws on anything but a 6- or 8-digit hex", () => {
    for (const bad of ["#fff", "#ffff", "334155", "#33415", "#gggggg"]) {
      expect(() => computedColour(bad)).toThrow(bad);
    }
  });
});

describe("role", () => {
  test("takes the light or dark palette by scheme", () => {
    expect(role("background", "light")).not.toBe(role("background", "dark"));
  });

  test("gives the dark header the dark scheme's colours", () => {
    expect(role("link", "dark-header")).toBe(role("link", "dark"));
  });
});
