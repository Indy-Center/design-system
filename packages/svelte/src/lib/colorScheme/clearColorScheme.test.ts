import { afterEach, describe, expect, test } from "vitest";
import { commands } from "vitest/browser";
import { storedCookie } from "../../../test/cookies.ts";
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

// The cookie's attributes are preferenceCookie's (its own tests).
describe("going back to the device's setting", () => {
  test("deletes the saved choice, so the next page follows the device", async () => {
    saveColorScheme("dark");
    clearColorScheme();
    expect(await storedCookie(COOKIE_NAME)).toBeUndefined();
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
});
