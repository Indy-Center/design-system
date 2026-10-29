import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { afterAll, describe, expect, test } from "vitest";
import { closeBrowser, pageWith } from "./browser.ts";

const require = createRequire(import.meta.url);
afterAll(closeBrowser);

const origin = "http://app.test";

/**
 * A page served from http://app.test that links the package's tokens.css
 * and fonts.css, as an app's bundler would ship them: each stylesheet at
 * its export, and the files it points to beside it.
 */
async function appPage(body: string) {
  const exports = {
    "/tokens.css": require.resolve("@indy-center/centerline-tokens/tokens.css"),
    "/fonts/fonts.css":
      require.resolve("@indy-center/centerline-tokens/fonts.css"),
  };
  const page = await pageWith("");
  await page.route(`${origin}/**`, async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === "/") {
      return route.fulfill({
        contentType: "text/html",
        body: `<!doctype html>
<link rel="stylesheet" href="/tokens.css">
<link rel="stylesheet" href="/fonts/fonts.css">
${body}`,
      });
    }
    const file =
      exports[path as keyof typeof exports] ??
      join(
        dirname(exports["/fonts/fonts.css"]),
        path.replace(/^\/fonts\//, ""),
      );
    try {
      return route.fulfill({ body: await readFile(file) });
    } catch {
      return route.fulfill({ status: 404 });
    }
  });
  await page.goto(`${origin}/`);
  await page.evaluate(() => document.fonts.ready);
  return page;
}

/** The fonts Chromium actually drew `selector`'s text with. */
async function renderedFonts(
  page: Awaited<ReturnType<typeof appPage>>,
  selector: string,
) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("DOM.enable");
  await cdp.send("CSS.enable");
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", {
    nodeId: root.nodeId,
    selector,
  });
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  return fonts;
}

describe("fonts.css", () => {
  test("a heading in font-heading renders in the shipped Source Sans 3", async () => {
    const page = await appPage(
      `<h1 style="font-family: var(--font-heading); font-weight: 600">Events</h1>`,
    );
    // The name table's names: the variable font's default instance.
    expect(await renderedFonts(page, "h1")).toEqual([
      expect.objectContaining({
        postScriptName: "SourceSans3-Roman",
        isCustomFont: true,
      }),
    ]);
  });

  test("it declares one upright face, weights 200 to 900, with font-display swap", async () => {
    const page = await appPage("");
    const faces = await page.evaluate(() =>
      [...document.fonts].map((f) => ({
        family: f.family,
        weight: f.weight,
        style: f.style,
        display: f.display,
      })),
    );
    expect(faces).toEqual([
      {
        family: "Source Sans 3",
        weight: "200 900",
        style: "normal",
        display: "swap",
      },
    ]);
  });
});
