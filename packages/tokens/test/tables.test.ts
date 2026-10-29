import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";
import { roles } from "./guide.ts";

const require = createRequire(import.meta.url);
const tables = await readFile(
  require.resolve("@indy-center/centerline-tokens/tables.md"),
  "utf8",
);

/** The lines between `<!-- name:start -->` and `<!-- name:end -->`. */
function between(name: string): string {
  const match = tables.match(
    new RegExp(`<!-- ${name}:start -->\\n([\\s\\S]*?)\\n<!-- ${name}:end -->`),
  );
  return match?.[1] ?? "";
}

// Copied from brand-guide/guide/color-and-type.md, lines as they stand.
const guideBrandColours = `| Name | Hex | Used for |
| --- | --- | --- |
| Night | \`#070F13\` | The "black" of the black logo and mark; avatar and link-preview backgrounds |
| Sky | \`#0369A1\` | The accent: main buttons, the current page number, links on light backgrounds |
| White | \`#FFFFFF\` | The white logo and mark; text on Sky |`;

// The guide's roles table, rebuilt from guide.ts's copy of it.
const guideRoles = [
  "| Role | Used for | Light | Dark |",
  "| --- | --- | --- | --- |",
  ...Object.entries(roles).map(
    ([name, { usedFor, light, dark }]) =>
      `| \`${name}\` | ${usedFor} | \`${light}\` | \`${dark}\` |`,
  ),
].join("\n");

describe("tables.md", () => {
  test("the brand colours table matches the guide's, between its markers", () => {
    expect(between("brand-colours")).toBe(guideBrandColours);
  });

  test("the roles table matches the guide's, between its markers", () => {
    expect(between("roles")).toBe(guideRoles);
  });
});
