import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

// Run after `npm run build`, as the test script does.
const root = new URL("..", import.meta.url);

/** The paths npm would publish. */
function packed(): string[] {
  const out = execFileSync("npm", ["pack", "--dry-run", "--json"], {
    cwd: root,
    encoding: "utf8",
  });
  return JSON.parse(out)[0].files.map((f: { path: string }) => f.path);
}

describe("the packed package", () => {
  const files = packed();

  test("holds each component, its generated types and its doc page", () => {
    expect(files).toEqual(
      expect.arrayContaining([
        "dist/index.js",
        "dist/index.d.ts",
        "dist/Link/Link.svelte",
        "dist/Link/Link.svelte.d.ts",
        "dist/Link/Link.md",
        "dist/colorScheme/colorScheme.md",
        "dist/aviation/aviation.md",
      ]),
    );
  });

  test("carries the MIT licence", () => {
    expect(files).toContain("LICENSE");
  });

  test("leaves out tests", () => {
    expect(files.filter((f) => /\.test\./.test(f))).toEqual([]);
  });

  test("exports Link from the package root, with types", async () => {
    const index = await readFile(new URL("dist/index.d.ts", root), "utf8");
    expect(index).toMatch(/export \{ default as Link \}/);
  });

  test("ships Table, Th and DescriptionList from the package root", async () => {
    expect(files).toEqual(
      expect.arrayContaining([
        "dist/Table/Table.svelte",
        "dist/Table/Th.svelte",
        "dist/Table/tableClasses.js",
        "dist/Table/Table.md",
        "dist/DescriptionList/DescriptionList.svelte",
        "dist/DescriptionList/DescriptionList.md",
      ]),
    );
    const index = await readFile(new URL("dist/index.d.ts", root), "utf8");
    for (const name of ["DescriptionList", "Table", "Th"]) {
      expect(index).toMatch(new RegExp(`export \\{ default as ${name}[ ,]`));
    }
    expect(index).toMatch(/type ThScope/);
  });

  test("exports saveColorScheme from the package root, with types", async () => {
    const index = await readFile(new URL("dist/index.d.ts", root), "utf8");
    expect(index).toMatch(/\bsaveColorScheme\b/);
  });

  test("exports the aviation helpers from the package root, with types", async () => {
    const index = await readFile(new URL("dist/index.d.ts", root), "utf8");
    for (const name of [
      "comparePositionTypes",
      "findRating",
      "formatDuration",
      "formatFrequency",
      "isPosition",
      "parseCallsign",
      "POSITION_TYPES",
      "RATINGS",
      "resolvePosition",
      "spokenFrequency",
      "VnasPosition",
    ]) {
      expect(index).toMatch(new RegExp(`\\b${name}\\b`));
    }
  });

  test("the built aviation helpers run, their imports resolved", async () => {
    const { resolvePosition } = await import(
      new URL("dist/aviation/resolvePosition.js", root).href
    );
    const positions = [{ id: "1", callsign: "IND_GND" }];
    expect(resolvePosition("IND_1_GND", positions)?.position.id).toBe("1");
  });

  test("serves the colour-scheme hook from /hooks, in Node, with types", async () => {
    const pkg = JSON.parse(
      await readFile(new URL("package.json", root), "utf8"),
    );
    const hooks = pkg.exports["./hooks"];
    expect(files).toContain(hooks.types.replace("./", ""));
    const { colorSchemeHandle } = await import("@indy-center/svelte/hooks");
    expect(colorSchemeHandle({ fallback: "dark" })).toBeTypeOf("function");
  });
});
