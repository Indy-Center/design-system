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
    "body, a bare border and a placeholder take the %s roles",
    async (scheme) => {
      expect(
        await styles(
          '<div class="border"></div><input placeholder="Search">',
          [
            ["body", "background-color"],
            ["body", "color"],
            ["div", "border-top-color"],
            ["input", "color", "::placeholder"],
          ],
          scheme,
        ),
      ).toEqual([
        rgb(roles.background[scheme]),
        rgb(roles.foreground[scheme]),
        rgb(roles.border[scheme]),
        rgb(roles.placeholder[scheme]),
      ]);
    },
  );

  test("text in a dark header on a light page takes the dark foreground", async () => {
    expect(
      await styles('<header data-theme="dark"><p>Events</p></header>', [
        ["p", "color"],
      ]),
    ).toEqual([rgb(roles.foreground.dark)]);
  });

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
          '<div id="role" role="button">Save</div>' +
          '<div id="role-off" role="button" aria-disabled="true">Save</div>',
        [
          ["#on", "cursor"],
          ["#off", "cursor"],
          ["#role", "cursor"],
          ["#role-off", "cursor"],
        ],
      ),
    ).toEqual(["pointer", "default", "pointer", "auto"]);
  });
});
