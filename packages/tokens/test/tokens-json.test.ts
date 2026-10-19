import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";
import { brandColours, roles } from "./guide.ts";

const require = createRequire(import.meta.url);
const tokens = JSON.parse(
  await readFile(require.resolve("@indy-center/tokens/tokens.json"), "utf8"),
);

function expected(scheme: "light" | "dark") {
  return {
    ...brandColours,
    ...Object.fromEntries(
      Object.entries(roles).map(([name, role]) => [name, role[scheme]]),
    ),
  };
}

describe("tokens.json", () => {
  test("light holds every role's light value and the brand colours, as the guide's hex", () => {
    expect(tokens.light.color).toEqual(expected("light"));
  });

  test("dark holds every role's dark value and the brand colours, as the guide's hex", () => {
    expect(tokens.dark.color).toEqual(expected("dark"));
  });

  test("each scheme holds the font stacks as CSS font-family values", () => {
    for (const scheme of ["light", "dark"]) {
      expect(tokens[scheme].font.heading).toMatch(
        /^"Source Sans 3", ui-sans-serif, system-ui, sans-serif,/,
      );
      expect(tokens[scheme].font.sans).toMatch(/^ui-sans-serif, system-ui,/);
      expect(tokens[scheme].font.mono).toMatch(
        /^ui-monospace, "SFMono-Regular",/,
      );
    }
  });
});
