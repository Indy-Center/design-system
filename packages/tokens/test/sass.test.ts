import { compileString, NodePackageImporter } from "sass";
import { describe, expect, test } from "vitest";

/** Compiles `scss` as an app would, finding the package in node_modules. */
function compile(scss: string): string {
  return compileString(scss, {
    importers: [new NodePackageImporter(import.meta.dirname)],
  }).css;
}

describe("_tokens.scss", () => {
  test("compiles, and token() gives each role as its tokens.css variable", () => {
    const css = compile(`
      @use "pkg:@indy-center/tokens/_tokens.scss" as tokens;
      .card {
        background: tokens.token("color.card");
        color: tokens.token("color.foreground");
        font-family: tokens.token("font.heading");
      }
    `);
    expect(css).toContain("background: var(--color-card);");
    expect(css).toContain("color: var(--color-foreground);");
    expect(css).toContain("font-family: var(--font-heading);");
  });

  test("an unknown token is a compile error", () => {
    expect(() =>
      compile(`
        @use "pkg:@indy-center/tokens/_tokens.scss" as tokens;
        a { color: tokens.token("color.nope"); }
      `),
    ).toThrow(/No token named "color.nope"/);
  });
});
