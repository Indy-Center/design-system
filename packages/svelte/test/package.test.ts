import { execFileSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import ts from "typescript";
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
      "Callout",
      "Card",
      "Checkbox",
      "Chip",
      "ChoiceCard",
      "Citation",
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
      "Header",
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
      "RichText",
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
      "TableOfContents",
      "Tabs",
      "Text",
      "Textarea",
      "Th",
      "Time",
      "TimeZoneLine",
      "TimeZoneSetting",
      "Toaster",
      "Tooltip",
      "UserMenu",
      "clearColorScheme",
      "comparePositionTypes",
      "confirmAction",
      "documentHeadings",
      "findPilotRating",
      "findRating",
      "formatDuration",
      "formatFrequency",
      "getPositions",
      "groupByPosition",
      "headingId",
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
      "BlockProps",
      "BlockSnippets",
      "CalloutLevel",
      "CallsignParts",
      "ChipVariant",
      "CitationSource",
      "ColorScheme",
      "ConfirmActionOptions",
      "CredentialKind",
      "Crumb",
      "DocumentHeading",
      "DurationStyle",
      "ErrorPageLink",
      "FieldControl",
      "FlightCategoryCode",
      "FooterColumn",
      "FooterLink",
      "FrequencyOptions",
      "HeaderMember",
      "HeadingIdFunction",
      "HeadingNode",
      "LinkDocument",
      "LinkHrefFunction",
      "MatchablePosition",
      "NavGroup",
      "NavItem",
      "NavLink",
      "OnlineMember",
      "PositionField",
      "PositionGroup",
      "PositionInfo",
      "PositionMatch",
      "PositionType",
      "RatingDetails",
      "ResolvePositionOptions",
      "RichTextState",
      "SaveColorSchemeOptions",
      "SetColorSchemeOptions",
      "SetTimeZoneOptions",
      "Severity",
      "SerializedNode",
      "SeverityDetails",
      "Step",
      "Tab",
      "ThScope",
      "TimeZoneChoice",
      "TimeZoneProfileSetting",
      "ToastCookies",
      "TooltipTrigger",
    ].sort();
    expect(await exportsOf("dist/index.d.ts")).toEqual({ values, types });
    expect(await exportsOf("dist/index.js")).toEqual({ values, types: [] });
  });

  // svelte-package turns a `.ts` module into `.js` but leaves import paths
  // inside `.svelte` files as written, so an import ending `.ts` there
  // points at a file the package doesn't have.
  test("every relative import in the built package names a file it ships", async () => {
    const built = files.filter((f) => /^dist\/.*\.(js|svelte)$/.test(f));
    for (const path of built) {
      const source = await readFile(new URL(path, root), "utf8");
      for (const [, from] of source.matchAll(
        /(?:from|import)\s*\(?\s*["'](\.[^"']+)["']/g,
      )) {
        const target = new URL(from, new URL(path, root)).pathname.slice(
          new URL(root).pathname.length,
        );
        expect(files, `${path} imports ${from}`).toContain(target);
      }
    }
    expect(built.length).toBeGreaterThan(100);
  });

  test("carries the MIT licence and leaves out tests", () => {
    expect(files).toContain("LICENSE");
    expect(files.filter((f) => /\.test\./.test(f))).toEqual([]);
  });

  // Payload reads it with no Svelte installed: nothing it loads, in its
  // JavaScript or its types, may import Svelte.
  test("serves the blocks contract from /blocks, in Node, with types and no Svelte import", async () => {
    const pkg = JSON.parse(
      await readFile(new URL("package.json", root), "utf8"),
    );
    const types = pkg.exports["./blocks"].types.replace("./", "");
    const code = pkg.exports["./blocks"].default.replace("./", "");
    expect(files).toEqual(expect.arrayContaining([types, code]));

    const blocks = await import("@indy-center/centerline-svelte/blocks");
    expect(Object.keys(blocks).sort()).toEqual([
      "AIRPORT_NAME_AT",
      "BLOCKS",
      "CALLOUT_LEVELS",
      "CONTROLLER_RATING_CODES",
      "FLIGHT_CATEGORIES",
      "PILOT_RATING_CODES",
      "POSITION_AIRPORT_AT",
      "POSITION_FIELDS",
      "RATING_KINDS",
    ]);

    // Every file the entry reaches through relative imports.
    const seen = new Set<string>();
    const visit = async (path: string) => {
      if (seen.has(path)) return;
      seen.add(path);
      const source = await readFile(new URL(path, root), "utf8");
      for (const [, from] of source.matchAll(/from\s+["']([^"']+)["']/g)) {
        expect(from, path).not.toMatch(/^svelte(\/|$)|\.svelte(\.js)?$/);
        if (from.startsWith(".")) {
          const next = new URL(from, new URL(path, root)).pathname;
          const relative = next.slice(new URL(root).pathname.length);
          await visit(
            path.endsWith(".d.ts")
              ? relative.replace(/\.js$/, ".d.ts")
              : relative,
          );
        }
      }
    };
    await visit(code);
    await visit(types);
    expect(seen.size).toBeGreaterThan(2);
  });

  test("the built aviation helpers run, their imports resolved", async () => {
    const { resolvePosition } = await import(
      new URL("dist/aviation/resolvePosition.js", root).href
    );
    const positions = [{ id: "1", callsign: "IND_GND" }];
    expect(resolvePosition("IND_1_GND", positions)?.position.id).toBe("1");
  });

  test("serves the time-zone reader, and nothing else, from /server, in Node, with types", async () => {
    const pkg = JSON.parse(
      await readFile(new URL("package.json", root), "utf8"),
    );
    expect(files).toContain(pkg.exports["./server"].types.replace("./", ""));

    const server = await import("@indy-center/centerline-svelte/server");
    expect(Object.keys(server)).toEqual(["readTimeZone"]);

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
    const { colorSchemeHandle } =
      await import("@indy-center/centerline-svelte/hooks");
    expect(colorSchemeHandle({ fallback: "dark" })).toBeTypeOf("function");
  });
});
