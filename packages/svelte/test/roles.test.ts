import tokens from "@indy-center/tokens/tokens.json" with { type: "json" };
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
});

describe("role", () => {
  test("reads the role's colour for the scheme from the tokens", () => {
    expect(role("foreground-soft", "light")).toBe(
      computedColour(tokens.light.color["foreground-soft"]),
    );
    expect(role("foreground-soft", "dark")).toBe(
      computedColour(tokens.dark.color["foreground-soft"]),
    );
  });

  test("gives the dark header the dark scheme's colours", () => {
    expect(role("link", "dark-header")).toBe(role("link", "dark"));
  });
});
