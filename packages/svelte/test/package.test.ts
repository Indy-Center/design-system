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
});
