import { afterEach, describe, expect, test, vi } from "vitest";
import { commands } from "vitest/browser";
import { htmlTheme, serve, template } from "../../../test/serve.ts";
import { COOKIE_NAME } from "./colorScheme.ts";
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

  test("the scheme lands on <html> when it isn't in the first chunk", async () => {
    const at = template.indexOf("<html");
    const page = await serve(colorSchemeHandle({ fallback: "dark" }), {
      chunks: [template.slice(0, at), template.slice(at), "<p>More</p>"],
    });
    expect(htmlTheme(page)).toBe("dark");
    expect(page.match(/data-theme/g)).toHaveLength(1);
  });
});

describe("with a choice in the cookie", () => {
  test.each([
    ["light", "dark"],
    ["dark", "device"],
  ] as const)(
    "%s is served, whatever the fallback (%s)",
    async (choice, fallback) => {
      const page = await serve(colorSchemeHandle({ fallback }), {
        cookie: `other=1; ${COOKIE_NAME}=${choice}`,
      });
      expect(htmlTheme(page)).toBe(choice);
    },
  );

  test("a value that isn't a choice counts as none", async () => {
    const page = await serve(colorSchemeHandle({ fallback: "dark" }), {
      cookie: `${COOKIE_NAME}=purple`,
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
    <script nonce="abc123">/* @indy-center/centerline-svelte color scheme */</script>
  </head>`,
    );
    await commands.emulateColorScheme("dark");
    expect(await themeInBrowser(await serve(handle, { html }))).toBe("dark");
  });
});

describe("the script tag in app.html, in dev", () => {
  const marker = "/* @indy-center/centerline-svelte color scheme */";
  const withMarker = template.replace(
    "</head>",
    `<script nonce="abc123">${marker}</script></head>`,
  );

  test("missing: one warning, naming the tag to add", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const handle = colorSchemeHandle({ fallback: "device" });
    await serve(handle);
    await serve(handle);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.join(" ")).toContain(marker);
    warn.mockRestore();
  });

  test("present: no warning", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await serve(colorSchemeHandle({ fallback: "device" }), {
      html: withMarker,
    });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
