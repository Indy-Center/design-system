import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { compile } from "tailwindcss";
import { afterAll, describe, expect, test } from "vitest";
import { closeBrowser, pageWith } from "./browser.ts";
import { brandColours, rgb, roles } from "./guide.ts";

afterAll(closeBrowser);

/**
 * Compiles an app's stylesheet the way Tailwind's Vite plugin would,
 * resolving each @import as an app would find it in node_modules.
 */
async function tailwind(css: string, candidates: string[]): Promise<string> {
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
  });
  return compiler.build(candidates);
}

const appCss = `
@import "tailwindcss";
@import "@indy-center/tokens/tokens.css";
@import "@indy-center/tokens/theme.css";
`;

/** A light page with a dark header, the guide's framed light. */
const page = `
<main>
  <div id="card" class="bg-card"></div>
  <div id="variant" class="bg-white dark:bg-night"></div>
  <h2 id="heading" class="font-heading">Events</h2>
  <span id="cid" class="font-mono">1234567</span>
</main>
<header data-theme="dark">
  <div id="dark-card" class="bg-card"></div>
  <div id="dark-variant" class="bg-white dark:bg-night"></div>
</header>
`;

const css = await tailwind(appCss, [
  "bg-card",
  "bg-white",
  "dark:bg-night",
  "font-heading",
  "font-mono",
]);

async function style(selector: string, property: string) {
  const p = await pageWith(`<style>${css}</style>${page}`);
  return p.$eval(
    selector,
    (el, property) => getComputedStyle(el).getPropertyValue(property),
    property,
  );
}

describe("Tailwind compiled against tokens.css and theme.css", () => {
  test("bg-card is the light card at the root", async () => {
    expect(await style("#card", "background-color")).toBe(
      rgb(roles.card.light),
    );
  });

  test("bg-card is the dark card inside a data-theme=dark element on a light page", async () => {
    expect(await style("#dark-card", "background-color")).toBe(
      rgb(roles.card.dark),
    );
  });

  test("dark: utilities apply inside a dark scope and not outside it", async () => {
    expect(await style("#dark-variant", "background-color")).toBe(
      rgb(brandColours.night),
    );
    expect(await style("#variant", "background-color")).toBe(
      rgb(brandColours.white),
    );
  });

  test("font-heading sets Source Sans 3 first", async () => {
    expect(await style("#heading", "font-family")).toMatch(/^"Source Sans 3",/);
  });

  test("font-mono is the system monospace with tabular numbers", async () => {
    expect(await style("#cid", "font-family")).toMatch(/^ui-monospace,/);
    expect(await style("#cid", "font-variant-numeric")).toBe("tabular-nums");
  });
});
