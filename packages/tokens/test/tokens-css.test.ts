import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { afterAll, describe, expect, test } from "vitest";
import { closeBrowser, pageWith } from "./browser.ts";
import { brandColours, rgb, roles } from "./guide.ts";

const require = createRequire(import.meta.url);
const tokensCss = await readFile(
  require.resolve("@indy-center/centerline-tokens/tokens.css"),
  "utf8",
);

afterAll(closeBrowser);

const names = [...Object.keys(roles), ...Object.keys(brandColours)];

/**
 * The colour each --color-* variable resolves to at the element matching
 * `selector`, as rgb(), and the element's color-scheme.
 */
async function coloursAt(html: string, selector: string) {
  const page = await pageWith(`<style>${tokensCss}</style>${html}`);
  return page.$eval(
    selector,
    (el, names) => {
      const colours: Record<string, string> = {};
      for (const name of names) {
        const probe = document.createElement("span");
        probe.style.color = `var(--color-${name})`;
        el.append(probe);
        colours[name] = getComputedStyle(probe).color;
        probe.remove();
      }
      return { colours, colorScheme: getComputedStyle(el).colorScheme };
    },
    names,
  );
}

function expected(scheme: "light" | "dark") {
  return Object.fromEntries([
    ...Object.entries(roles).map(([name, role]) => [name, rgb(role[scheme])]),
    ...Object.entries(brandColours).map(([name, hex]) => [name, rgb(hex)]),
  ]);
}

describe("tokens.css", () => {
  test("the root holds every role's light value and the brand colours", async () => {
    const { colours, colorScheme } = await coloursAt(
      `<main id="target"></main>`,
      "#target",
    );
    expect(colours).toEqual(expected("light"));
    expect(colorScheme).toBe("light");
  });

  test("an element with data-theme=dark on a light page holds every role's dark value", async () => {
    const { colours, colorScheme } = await coloursAt(
      `<main><header data-theme="dark"><p id="target"></p></header></main>`,
      "#target",
    );
    expect(colours).toEqual(expected("dark"));
    expect(colorScheme).toBe("dark");
  });

  test("data-theme=dark on <html> darkens the whole page", async () => {
    const { colours } = await coloursAt(
      `<script>document.documentElement.dataset.theme = "dark"</script><main id="target"></main>`,
      "#target",
    );
    expect(colours).toEqual(expected("dark"));
  });
});
