import { afterEach, describe, expect, test, vi } from "vitest";
import { commands } from "vitest/browser";
import { forgetColorScheme } from "../../playground/forgetColorScheme.ts";
import { htmlTheme, serve } from "../../../test/serve.ts";
import { COOKIE_NAME } from "./colorScheme.ts";
import { colorSchemeHandle } from "./colorSchemeHandle.ts";
import { saveColorScheme } from "./saveColorScheme.ts";

// The guide's Roles table: background, light and dark.
const lightBackground = "rgb(241, 245, 249)"; // #F1F5F9
const darkBackground = "rgb(17, 24, 39)"; // #111827

const added: HTMLElement[] = [];

afterEach(() => {
  forgetColorScheme();
  delete document.documentElement.dataset.theme;
  for (const element of added.splice(0)) element.remove();
});

/** Puts `element` on the page for this test. */
function add<E extends HTMLElement>(element: E): E {
  document.body.append(element);
  added.push(element);
  return element;
}

function background(element: Element): string {
  return getComputedStyle(element).backgroundColor;
}

/** The scheme cookie as the browser stored it. */
async function storedCookie() {
  const cookies = await commands.storedCookies();
  return cookies.find((cookie) => cookie.name === COOKIE_NAME);
}

describe("saving a choice", () => {
  test("applies it to the page at once", () => {
    const main = add(document.createElement("main"));
    main.className = "bg-background";
    document.documentElement.dataset.theme = "dark";

    saveColorScheme("light");
    expect(background(main)).toBe(lightBackground);

    saveColorScheme("dark");
    expect(background(main)).toBe(darkBackground);
  });

  test.each(["light", "dark"] as const)(
    "%s is served from the cookie on the next page",
    async (choice) => {
      saveColorScheme(choice);
      const page = await serve(colorSchemeHandle({ fallback: "dark" }), {
        cookie: document.cookie,
      });
      expect(htmlTheme(page)).toBe(choice);
    },
  );

  test("keeps it for a year, on every path", async () => {
    saveColorScheme("light");
    const cookie = await storedCookie();
    const year = 365 * 24 * 60 * 60;
    expect(cookie?.path).toBe("/");
    expect(cookie?.sameSite).toBe("Lax");
    expect(cookie?.expires).toBeGreaterThan(Date.now() / 1000 + year - 60);
  });
});

describe("the cookie's domain", () => {
  test("is the given domain on its sites", () => {
    // Chrome stores Domain=localhost as host-only, so read what is written.
    const written = vi.spyOn(Document.prototype, "cookie", "set");
    // The test page isn't on flyindycenter.com; its own host stands in.
    saveColorScheme("light", { domain: location.hostname });
    expect(written).toHaveBeenCalledWith(
      expect.stringContaining(`; Domain=${location.hostname}`),
    );
    written.mockRestore();
  });

  test("is left off where the page isn't on it, such as localhost", async () => {
    saveColorScheme("light");
    expect((await storedCookie())?.domain).toBe(location.hostname);
  });
});

describe("the dark header", () => {
  test.each(["light", "dark"] as const)(
    "stays dark when %s is chosen",
    (choice) => {
      const header = add(document.createElement("header"));
      header.dataset.theme = "dark";
      header.className = "bg-background";

      saveColorScheme(choice);
      expect(background(header)).toBe(darkBackground);
    },
  );
});
