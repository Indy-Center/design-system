import { afterAll, describe, expect, test } from "vitest";
import { closeBrowser, pageWith } from "./browser.ts";
import { tailwind } from "./compile.ts";
import { rgb, roles } from "./guide.ts";

afterAll(closeBrowser);

const css = await tailwind(
  `
@import "tailwindcss";
@import "@indy-center/tokens/tokens.css";
@import "@indy-center/tokens/theme.css";
@import "@indy-center/tokens/base.css";
`,
  ["border"],
);

/**
 * Computed styles on a page holding `body`, light unless `scheme` says:
 * one value per [selector, property, pseudo-element?].
 */
async function styles(
  body: string,
  queries: [selector: string, property: string, pseudo?: string][],
  scheme: "light" | "dark" = "light",
): Promise<string[]> {
  const page = await pageWith(
    `<html data-theme="${scheme}"><head><style>${css}</style></head>` +
      `<body>${body}</body></html>`,
  );
  try {
    return await page.evaluate(
      (queries) =>
        queries.map(([selector, property, pseudo]) =>
          getComputedStyle(
            document.querySelector(selector)!,
            pseudo,
          ).getPropertyValue(property),
        ),
      queries,
    );
  } finally {
    await page.close();
  }
}

describe("base.css after tokens.css and theme.css", () => {
  test.each(["light", "dark"] as const)(
    "body takes the %s background and foreground roles",
    async (scheme) => {
      expect(
        await styles(
          "",
          [
            ["body", "background-color"],
            ["body", "color"],
          ],
          scheme,
        ),
      ).toEqual([rgb(roles.background[scheme]), rgb(roles.foreground[scheme])]);
    },
  );

  test.each(["light", "dark"] as const)(
    "a bare border takes the %s border role",
    async (scheme) => {
      expect(
        await styles(
          '<div class="border"></div>',
          [["div", "border-top-color"]],
          scheme,
        ),
      ).toEqual([rgb(roles.border[scheme])]);
    },
  );

  test.each(["light", "dark"] as const)(
    "a placeholder takes the %s placeholder role",
    async (scheme) => {
      expect(
        await styles(
          '<input placeholder="Search">',
          [["input", "color", "::placeholder"]],
          scheme,
        ),
      ).toEqual([rgb(roles.placeholder[scheme])]);
    },
  );

  test("body is the sans font and headings the heading font", async () => {
    const levels = [1, 2, 3, 4, 5, 6];
    const [body, ...headings] = await styles(
      levels.map((n) => `<h${n}>Events</h${n}>`).join(""),
      [
        ["body", "font-family"],
        ...levels.map((n): [string, string] => [`h${n}`, "font-family"]),
      ],
    );
    expect(body).toMatch(/^ui-sans-serif,/);
    for (const heading of headings) {
      expect(heading).toMatch(/^"Source Sans 3",/);
    }
  });

  test("an enabled button has a pointer and a disabled one doesn't", async () => {
    expect(
      await styles(
        '<button id="on">Save</button><button id="off" disabled>Save</button>' +
          '<div id="role" role="button">Save</div>',
        [
          ["#on", "cursor"],
          ["#off", "cursor"],
          ["#role", "cursor"],
        ],
      ),
    ).toEqual(["pointer", "default", "pointer"]);
  });

  test("a paragraph inherits its parent's colour", async () => {
    expect(
      await styles('<div style="color: rgb(1, 2, 3)"><p>Text</p></div>', [
        ["p", "color"],
      ]),
    ).toEqual(["rgb(1, 2, 3)"]);
  });
});
