import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { compile } from "tailwindcss";

/**
 * Compiles an app's stylesheet the way Tailwind's Vite plugin would,
 * resolving each @import as an app would find it in node_modules.
 */
export async function tailwind(
  css: string,
  candidates: string[],
): Promise<string> {
  const compiler = await compile(css, {
    base: import.meta.dirname,
    async loadStylesheet(id, base) {
      const require = createRequire(join(base, "app.css"));
      // Bare "tailwindcss" is its "style" export, which require can't pick.
      const path = require.resolve(
        id === "tailwindcss" ? "tailwindcss/index.css" : id,
      );
      return {
        path,
        base: dirname(path),
        content: await readFile(path, "utf8"),
      };
    },
    // A plugin the stylesheet names (@plugin "@tailwindcss/typography").
    async loadModule(id, base) {
      const require = createRequire(join(base, "app.css"));
      const path = require.resolve(id);
      return { path, base: dirname(path), module: require(path) };
    },
  });
  return compiler.build(candidates);
}
