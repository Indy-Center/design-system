import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { describe, expect, test } from "vitest";

const packageDir = new URL("..", import.meta.url);

/** The files `npm pack` would publish, from the built package. */
async function packedFiles(): Promise<string[]> {
  const { stdout } = await promisify(execFile)(
    "npm",
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { cwd: packageDir },
  );
  const [pack] = JSON.parse(stdout);
  return pack.files.map((file: { path: string }) => file.path).sort();
}

describe("the packed package", () => {
  test("holds every output, the font with its OFL, and the MIT licence", async () => {
    expect(await packedFiles()).toEqual(
      [
        "LICENSE",
        "README.md",
        "package.json",
        "dist/tokens.css",
        "dist/theme.css",
        "dist/_tokens.scss",
        "dist/tokens.json",
        "dist/tables.md",
        "fonts/fonts.css",
        "fonts/source-sans-3-latin-wght-normal.woff2",
        "fonts/OFL.txt",
        "prose.css",
      ].sort(),
    );
  });

  test("every export points at a packed file", async () => {
    const files = await packedFiles();
    const { exports } = JSON.parse(
      await readFile(new URL("package.json", packageDir), "utf8"),
    );
    for (const target of Object.values<string>(exports)) {
      expect(files).toContain(target.replace(/^\.\//, ""));
    }
  });
});
