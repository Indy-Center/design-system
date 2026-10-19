import { afterEach, describe, expect, test } from "vitest";
import { commands } from "vitest/browser";
import { htmlTheme, serve, template } from "../../../test/serve.ts";
import { colorSchemeHandle } from "./colorSchemeHandle.ts";

/**
 * Loads `page` in a frame, as a browser would, and returns the `data-theme`
 * its `<html>` ends up with once its scripts have run.
 */
async function themeInBrowser(page: string): Promise<string | undefined> {
  const frame = document.createElement("iframe");
  const loaded = new Promise((done) => (frame.onload = done));
  frame.srcdoc = page;
  document.body.append(frame);
  await loaded;
  const theme = frame.contentDocument?.documentElement.dataset.theme;
  frame.remove();
  return theme;
}

afterEach(() => commands.emulateColorScheme(null));

describe("with no cookie", () => {
  test("fallback 'dark' serves the page dark", async () => {
    const page = await serve(colorSchemeHandle({ fallback: "dark" }));
    expect(htmlTheme(page)).toBe("dark");
  });
});

describe("with a choice in the cookie", () => {
  test.each([
    ["light", "dark"],
    ["light", "device"],
    ["dark", "dark"],
    ["dark", "device"],
  ] as const)(
    "%s is served, whatever the fallback (%s)",
    async (choice, fallback) => {
      const page = await serve(colorSchemeHandle({ fallback }), {
        cookie: `other=1; indy-color-scheme=${choice}`,
      });
      expect(htmlTheme(page)).toBe(choice);
    },
  );

  test("a value that isn't a choice counts as none", async () => {
    const page = await serve(colorSchemeHandle({ fallback: "dark" }), {
      cookie: "indy-color-scheme=purple",
    });
    expect(htmlTheme(page)).toBe("dark");
  });
});

describe("with no cookie and fallback 'device'", () => {
  const handle = colorSchemeHandle({ fallback: "device" });

  test("the server writes no scheme", async () => {
    expect(htmlTheme(await serve(handle))).toBeUndefined();
  });

  test("a dark device gets dark", async () => {
    await commands.emulateColorScheme("dark");
    expect(await themeInBrowser(await serve(handle))).toBe("dark");
  });

  test.each(["light", "no-preference"] as const)(
    "a device set to %s gets light",
    async (device) => {
      await commands.emulateColorScheme(device);
      expect(await themeInBrowser(await serve(handle))).not.toBe("dark");
    },
  );

  test("the script runs under a CSP, given the nonce in the app's template", async () => {
    const html = template.replace(
      "</head>",
      `<meta http-equiv="Content-Security-Policy" content="script-src 'nonce-abc123'" />
    <script nonce="abc123">/* @indy-center/svelte color scheme */</script>
  </head>`,
    );
    await commands.emulateColorScheme("dark");
    expect(await themeInBrowser(await serve(handle, { html }))).toBe("dark");
  });
});
