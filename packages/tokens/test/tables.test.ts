import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { describe, expect, test } from "vitest";

const require = createRequire(import.meta.url);
const tables = await readFile(
  require.resolve("@indy-center/tokens/tables.md"),
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

const guideRoles = `| Role | Used for | Light | Dark |
| --- | --- | --- | --- |
| \`background\` | Page background | \`#F1F5F9\` | \`#111827\` |
| \`card\` | Cards and panels | \`#FFFFFF\` | \`#1E293B\` |
| \`muted\` | Raised areas, input fills, table heads | \`#E2E8F0\` | \`#334155\` |
| \`border\` | Lines around cards and tables | \`#E2E8F0\` | \`#334155\` |
| \`input\` | Input borders | \`#64748B\` | \`#64748B\` |
| \`foreground\` | Headings | \`#0F172A\` | \`#FFFFFF\` |
| \`foreground-soft\` | Body text | \`#334155\` | \`#D1D5DB\` |
| \`muted-foreground\` | Captions and fine print | \`#475569\` | \`#9CA3AF\` |
| \`placeholder\` | Placeholder text in inputs | \`#475569\` | \`#D1D5DB\` |
| \`primary\` | Main buttons, the current page number | \`#0369A1\` | \`#0369A1\` |
| \`primary-hover\` | Main buttons on hover | \`#075985\` | \`#075985\` |
| \`primary-foreground\` | Text on main buttons | \`#FFFFFF\` | \`#FFFFFF\` |
| \`link\` | Links | \`#0369A1\` | \`#38BDF8\` |
| \`ring\` | Focus outlines | \`#0284C7\` | \`#0EA5E9\` |
| \`destructive\` | Errors and actions that delete | \`#B91C1C\` | \`#F87171\` |
| \`success\` | Success | \`#15803D\` | \`#4ADE80\` |
| \`warning\` | Warnings | \`#A16207\` | \`#FACC15\` |
| \`info\` | Information and notices | \`#0369A1\` | \`#38BDF8\` |`;

describe("tables.md", () => {
  test("the brand colours table matches the guide's, between its markers", () => {
    expect(between("brand-colours")).toBe(guideBrandColours);
  });

  test("the roles table matches the guide's, between its markers", () => {
    expect(between("roles")).toBe(guideRoles);
  });
});
