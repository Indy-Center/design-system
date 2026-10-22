import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import ts from "typescript";
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

/** The names a built module exports, split into values and type-only ones. */
async function exportsOf(path: string) {
  const file = ts.createSourceFile(
    path,
    await readFile(new URL(path, root), "utf8"),
    ts.ScriptTarget.Latest,
  );
  const values: string[] = [];
  const types: string[] = [];
  for (const statement of file.statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    const clause = statement.exportClause;
    if (!clause || !ts.isNamedExports(clause)) continue;
    for (const element of clause.elements) {
      const typeOnly = statement.isTypeOnly || element.isTypeOnly;
      (typeOnly ? types : values).push(element.name.text);
    }
  }
  return { values: values.sort(), types: types.sort() };
}

/** Each file under src/lib, relative to it, tests left out. */
const sources = readdirSync(new URL("src/lib", root), {
  recursive: true,
  encoding: "utf8",
}).filter((f) => /\.(svelte|ts|md)$/.test(f) && !/\.test\./.test(f));

/** The folders with a doc page: the package's public pieces. */
const documented = sources
  .filter((f) => /^([^/]+)\/\1\.md$/.test(f))
  .map((f) => f.split("/")[0]);

describe("the packed package", () => {
  const files = packed();

  test("ships each module in src/lib, built, with its types and doc page, and the root exports each documented folder", async () => {
    const expected = sources.flatMap((f) => {
      if (f.endsWith(".svelte")) return [`dist/${f}`, `dist/${f}.d.ts`];
      if (f.endsWith(".ts"))
        return [
          `dist/${f.replace(/\.ts$/, ".js")}`,
          `dist/${f.replace(/\.ts$/, ".d.ts")}`,
        ];
      return [`dist/${f}`];
    });
    expect(files).toEqual(expect.arrayContaining(expected));
    // Guards the walk itself: one that found nothing would expect nothing.
    expect(documented).toEqual(
      expect.arrayContaining([
        "Link",
        "Table",
        "Toast",
        "aviation",
        "severity",
      ]),
    );

    const index = await readFile(new URL("dist/index.js", root), "utf8");
    const { values } = await exportsOf("dist/index.d.ts");
    for (const folder of documented) {
      expect(index, folder).toContain(`from "./${folder}/`);
      // A component folder's own component, under its own name.
      if (sources.includes(`${folder}/${folder}.svelte`))
        expect(values, folder).toContain(folder);
    }
  });

  test("exports these names from the package root, in its JavaScript and its types", async () => {
    const values = [
      "Airport",
      "Alert",
      "AppNav",
      "AppNavMenu",
      "AppsMenu",
      "BADGE_VARIANTS",
      "Badge",
      "Breadcrumbs",
      "Button",
      "CHIP_VARIANTS",
      "Card",
      "Checkbox",
      "Chip",
      "ChoiceCard",
      "ColorSchemeSetting",
      "Combobox",
      "ConfirmDialog",
      "CopyButton",
      "Credential",
      "DateTimeInput",
      "DescriptionList",
      "Disclosure",
      "DropdownMenu",
      "DropdownMenuItem",
      "EmptyState",
      "ErrorPage",
      "Field",
      "Fieldset",
      "FLIGHT_CATEGORIES",
      "FilterChip",
      "FlightCategory",
      "Footer",
      "Frequency",
      "Heading",
      "INDY_CENTER_APPS",
      "Icon",
      "Input",
      "Link",
      "Member",
      "Modal",
      "OnlineController",
      "PILOT_RATINGS",
      "POSITION_TYPES",
      "PageHeader",
      "PageHero",
      "Pagination",
      "Panel",
      "Position",
      "ProgressBar",
      "Prose",
      "RATINGS",
      "Radio",
      "Rating",
      "SEVERITIES",
      "SearchInput",
      "Select",
      "SkipLink",
      "Spinner",
      "StarDisplay",
      "StarRating",
      "StatCard",
      "Steps",
      "Switch",
      "Table",
      "Tabs",
      "Text",
      "Textarea",
      "Th",
      "Time",
      "TimeZoneLine",
      "TimeZoneSetting",
      "Toaster",
      "Tooltip",
      "clearColorScheme",
      "comparePositionTypes",
      "confirmAction",
      "findPilotRating",
      "findRating",
      "formatDuration",
      "formatFrequency",
      "getPositions",
      "groupByPosition",
      "isPosition",
      "logoffFromInfo",
      "parseCallsign",
      "resolvePosition",
      "saveColorScheme",
      "setColorScheme",
      "setPositions",
      "setTimeZone",
      "spokenFrequency",
      "toast",
      "toastFromServer",
    ].sort();
    const types = [
      "AirportInfo",
      "App",
      "BadgeVariant",
      "CallsignParts",
      "ChipVariant",
      "ColorScheme",
      "ConfirmActionOptions",
      "CredentialKind",
      "Crumb",
      "DurationStyle",
      "ErrorPageLink",
      "FieldControl",
      "FlightCategoryCode",
      "FooterColumn",
      "FooterLink",
      "FrequencyOptions",
      "NavGroup",
      "NavItem",
      "NavLink",
      "OnlineMember",
      "PositionField",
      "PositionGroup",
      "PositionMatch",
      "PositionType",
      "RatingDetails",
      "ResolvePositionOptions",
      "SaveColorSchemeOptions",
      "SetColorSchemeOptions",
      "SetTimeZoneOptions",
      "Severity",
      "SeverityDetails",
      "Step",
      "Tab",
      "ThScope",
      "TimeZoneChoice",
      "TimeZoneProfileSetting",
      "ToastCookies",
      "TooltipTrigger",
      "VnasPosition",
    ].sort();
    expect(await exportsOf("dist/index.d.ts")).toEqual({ values, types });
    expect(await exportsOf("dist/index.js")).toEqual({ values, types: [] });
  });

  test("carries the MIT licence and leaves out tests", () => {
    expect(files).toContain("LICENSE");
    expect(files.filter((f) => /\.test\./.test(f))).toEqual([]);
  });

  test("the built aviation helpers run, their imports resolved", async () => {
    const { resolvePosition } = await import(
      new URL("dist/aviation/resolvePosition.js", root).href
    );
    const positions = [{ id: "1", callsign: "IND_GND" }];
    expect(resolvePosition("IND_1_GND", positions)?.position.id).toBe("1");
  });

  test("serves the positions fetcher and the time-zone reader from /server, in Node, with types", async () => {
    const pkg = JSON.parse(
      await readFile(new URL("package.json", root), "utf8"),
    );
    expect(files).toContain(pkg.exports["./server"].types.replace("./", ""));

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
    expect(Object.keys(server).sort()).toEqual([
      "fetchPositions",
      "readTimeZone",
    ]);
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

    const cookies = (value: string) => ({ get: () => value });
    // A zone under either of its names, whichever this runtime lists.
    expect(server.readTimeZone(cookies("device:Asia/Kolkata"))).toEqual({
      kind: "device",
      zone: "Asia/Kolkata",
    });
    expect(
      server.readTimeZone(cookies("America/Indiana/Indianapolis")),
    ).toEqual({ kind: "zone", zone: "America/Indiana/Indianapolis" });
    expect(server.readTimeZone(cookies("UTC"))).toEqual({
      kind: "zone",
      zone: "UTC",
    });
    expect(server.readTimeZone(cookies("Nowhere/Else"))).toBeUndefined();
  });

  test("serves the colour-scheme hook from /hooks, in Node, with types", async () => {
    const pkg = JSON.parse(
      await readFile(new URL("package.json", root), "utf8"),
    );
    expect(files).toContain(pkg.exports["./hooks"].types.replace("./", ""));
    const { colorSchemeHandle } = await import("@indy-center/svelte/hooks");
    expect(colorSchemeHandle({ fallback: "dark" })).toBeTypeOf("function");
  });
});
