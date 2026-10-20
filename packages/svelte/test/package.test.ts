import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { describe, expect, onTestFinished, test, vi } from "vitest";

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

  test("serves the positions fetcher from /server, in Node, with types", async () => {
    const pkg = JSON.parse(
      await readFile(new URL("package.json", root), "utf8"),
    );
    expect(files).toContain(pkg.exports["./server"].types.replace("./", ""));
    expect(files).toContain("dist/positions/positions.md");

    // Data Admin stubbed, so the test stays off the network.
    vi.stubGlobal("fetch", async () =>
      Response.json({
        lastUpdatedAt: "2026-10-17T02:35:43.475Z",
        facility: {
          name: "Indianapolis ARTCC",
          positions: [
            {
              id: "1",
              callsign: "IND_GND",
              name: "Ground",
              radioName: "Indy  Ground",
              frequency: 121900000,
              starred: true,
            },
          ],
        },
      }),
    );
    onTestFinished(() => {
      vi.unstubAllGlobals();
    });
    const server = await import("@indy-center/svelte/server");
    expect(Object.keys(server)).toEqual(["fetchPositions"]);
    expect(await server.fetchPositions("ZID")).toEqual([
      {
        id: "1",
        callsign: "IND_GND",
        name: "Ground",
        radioName: "Indy Ground",
        frequency: 121900000,
        facility: "Indianapolis ARTCC",
        starred: true,
      },
    ]);
  });

  test("exports the positions context from the package root, with types", async () => {
    const index = await readFile(new URL("dist/index.d.ts", root), "utf8");
    expect(index).toMatch(/\bsetPositions\b/);
    expect(index).toMatch(/\bgetPositions\b/);
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
