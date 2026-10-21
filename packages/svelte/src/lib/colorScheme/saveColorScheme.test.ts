import { afterEach, describe, expect, test } from "vitest";
import { forgetColorScheme } from "../../playground/forgetColorScheme.ts";
import { role } from "../../../test/roles.ts";
import { htmlTheme, serve } from "../../../test/serve.ts";
import { colorSchemeHandle } from "./colorSchemeHandle.ts";
import { saveColorScheme } from "./saveColorScheme.ts";

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

// The cookie's attributes are preferenceCookie's (its own tests).
describe("saving a choice", () => {
  test("applies it to the page at once", async () => {
    const main = add(document.createElement("main"));
    main.className = "bg-background";
    document.documentElement.dataset.theme = "dark";

    saveColorScheme("light");
    await expect
      .element(main)
      .toHaveStyle({ backgroundColor: role("background", "light") });

    saveColorScheme("dark");
    await expect
      .element(main)
      .toHaveStyle({ backgroundColor: role("background", "dark") });
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
});
