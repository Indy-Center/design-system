import { afterEach, describe, expect, test, vi } from "vitest";
import { commands } from "vitest/browser";
import { forgetColorScheme } from "../../playground/forgetColorScheme.ts";
import { htmlTheme, serve } from "../../../test/serve.ts";
import { clearColorScheme } from "./clearColorScheme.ts";
import { COOKIE_NAME } from "./colorScheme.ts";
import { colorSchemeHandle } from "./colorSchemeHandle.ts";
import { saveColorScheme } from "./saveColorScheme.ts";

afterEach(async () => {
  forgetColorScheme();
  delete document.documentElement.dataset.theme;
  await commands.emulateColorScheme(null);
});

async function storedCookie() {
  const cookies = await commands.storedCookies();
  return cookies.find((cookie) => cookie.name === COOKIE_NAME);
}

describe("going back to the device's setting", () => {
  test("deletes the saved choice", async () => {
    saveColorScheme("light");
    clearColorScheme();
    expect(await storedCookie()).toBeUndefined();
  });

  test("the next page is served from the device's setting", async () => {
    saveColorScheme("dark");
    clearColorScheme();
    const page = await serve(colorSchemeHandle({ fallback: "device" }), {
      cookie: document.cookie,
    });
    expect(htmlTheme(page)).toBeUndefined();
  });

  test("a dark device turns the page dark at once", async () => {
    await commands.emulateColorScheme("dark");
    saveColorScheme("light");
    clearColorScheme();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  test("a light device turns the page light at once", async () => {
    await commands.emulateColorScheme("light");
    saveColorScheme("dark");
    clearColorScheme();
    expect(document.documentElement.dataset.theme).toBeUndefined();
  });

  test("deletes it on the domain it was saved on", () => {
    const written = vi.spyOn(Document.prototype, "cookie", "set");
    clearColorScheme({ domain: location.hostname });
    expect(written).toHaveBeenCalledWith(
      expect.stringMatching(
        new RegExp(
          `^${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax; Domain=${location.hostname}`,
        ),
      ),
    );
    written.mockRestore();
  });
});
