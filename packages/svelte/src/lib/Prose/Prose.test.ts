import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn, type Scheme } from "../../../test/schemes.ts";
import ProseLesson from "../../../test/ProseLesson.svelte";

// The roles the theme uses, in a scheme.
const roles = (scheme: Scheme) => ({
  foreground: role("foreground", scheme),
  foregroundSoft: role("foreground-soft", scheme),
  mutedForeground: role("muted-foreground", scheme),
  link: role("link", scheme),
  info: role("info", scheme),
  muted: role("muted", scheme),
  border: role("border", scheme),
  ring: role("ring", scheme),
});
const schemes = SCHEMES.map((scheme) => [scheme, roles(scheme)] as const);

// The plugin puts backticks round inline code and marks round quotes, in
// ::before and ::after; the theme takes them out.
function expectNoMarks(element: Element) {
  expect(getComputedStyle(element, "::before").content).toBe("none");
  expect(getComputedStyle(element, "::after").content).toBe("none");
}

describe("Prose", () => {
  test("is an article holding the lesson", async () => {
    const screen = await renderIn("light", ProseLesson, {});
    await expect
      .element(
        screen
          .getByRole("article")
          .getByRole("heading", { level: 2, name: "Taxi clearances" }),
      )
      .toBeVisible();
  });

  test("as div, it is no article, and keeps a caller's class and attributes", async () => {
    const screen = await renderIn("light", ProseLesson, {
      as: "div",
      id: "body",
      class: "mt-8",
    });
    await expect.element(screen.getByRole("article")).not.toBeInTheDocument();
    const body = screen.container.querySelector("#body")!;
    expect(body.tagName).toBe("DIV");
    expect(getComputedStyle(body).marginTop).toBe("32px");
    expect(getComputedStyle(body).color).toBe(role("foreground-soft", "light"));
  });

  test.each(schemes)(
    "body text is the body colour in %s",
    async (scheme, { foregroundSoft }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      await expect
        .element(screen.getByText(/^A taxi clearance gives/))
        .toHaveStyle({ color: foregroundSoft });
    },
  );

  test.each(schemes)(
    "links are the link colour in %s",
    async (scheme, { link }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      await expect
        .element(screen.getByRole("link", { name: "FAA 7110.65" }))
        .toHaveStyle({ color: link });
    },
  );

  // As Link: colour alone doesn't mark a link in body text (WCAG 1.4.1).
  test("links look like Link: underlined at an offset, in the body's weight", async () => {
    const screen = await renderIn("light", ProseLesson, {});
    await expect
      .element(screen.getByRole("link", { name: "FAA 7110.65" }))
      .toHaveStyle({
        textDecorationLine: "underline",
        textUnderlineOffset: "4px",
        fontWeight: "400",
      });
  });

  test("a link's underline thickens on hover", async () => {
    const screen = await renderIn("light", ProseLesson, {});
    const link = screen.getByRole("link", { name: "FAA 7110.65" });
    await userEvent.hover(link);
    await expect.element(link).toHaveStyle({ textDecorationThickness: "2px" });
  });

  test.each(schemes)(
    "a link shows a ring outline when tabbed to in %s",
    async (scheme, { ring }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      await userEvent.tab();
      const link = screen.getByRole("link", { name: "FAA 7110.65" });
      await expect.element(link).toHaveFocus();
      await expect
        .element(link)
        .toHaveStyle({ outlineStyle: "solid", outlineColor: ring });
    },
  );

  test.each(schemes)(
    "headings are the heading colour in %s",
    async (scheme, { foreground }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      await expect
        .element(screen.getByRole("heading", { name: "Taxi clearances" }))
        .toHaveStyle({ color: foreground });
    },
  );

  // Heading's looks: h2 xl, h3 lg, h4 base, semibold in the heading font.
  test.each([
    [2, "Taxi clearances", "20px"],
    [3, "Phraseology", "18px"],
    [4, "Readbacks", "16px"],
  ] as const)(
    "an h%i is Heading's size for its level",
    async (level, name, size) => {
      const screen = await renderIn("light", ProseLesson, {});
      const heading = screen.getByRole("heading", { level, name });
      await expect
        .element(heading)
        .toHaveStyle({ fontSize: size, fontWeight: "600" });
      expect(getComputedStyle(heading.element()).fontFamily).toMatch(
        /^"Source Sans 3",/,
      );
    },
  );

  test.each(schemes)(
    "the table head is muted, with no heavier rule, in %s",
    async (scheme, { muted, border, foreground }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      const head = screen.getByText("Mistake", { exact: true });
      await expect.element(head).toHaveStyle({ color: foreground });
      const thead = head.element().closest("thead")!;
      expect(getComputedStyle(thead).backgroundColor).toBe(muted);
      expect(getComputedStyle(thead).borderBottomColor).toBe(border);
    },
  );

  test.each(schemes)(
    "inline code is a muted chip in %s",
    async (scheme, { muted, foreground }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      await expect
        .element(screen.getByText("KXMP"))
        .toHaveStyle({ color: foreground, backgroundColor: muted });
    },
  );

  test("inline code has no backticks around it", async () => {
    const screen = await renderIn("light", ProseLesson, {});
    expectNoMarks(screen.getByText("KXMP").element());
  });

  test.each(schemes)(
    "a code block is on muted in %s",
    async (scheme, { muted, foreground }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      const code = screen.getByText(/^N123AB, runway 27/);
      await expect.element(code).toHaveStyle({ color: foreground });
      const pre = code.element().closest("pre")!;
      expect(getComputedStyle(pre).backgroundColor).toBe(muted);
    },
  );

  // The quote's rule is the sky, in the info role.
  test.each(schemes)(
    "a quote has a sky rule and no quote marks in %s",
    async (scheme, { info }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      const text = screen.getByText(/^An aircraft must not cross/);
      await expect.element(text).toBeVisible();
      const quote = text.element().closest("blockquote")!;
      expect(getComputedStyle(quote).borderInlineStartColor).toBe(info);
      expect(getComputedStyle(quote).fontStyle).toBe("normal");
      expectNoMarks(text.element());
    },
  );

  test.each(schemes)(
    "list numbers and bullets are muted in %s",
    async (scheme, { mutedForeground }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      const numbered = screen.getByText("Call sign.").element();
      const bulleted = screen.getByText(/^Open the field diagram/).element();
      expect(getComputedStyle(numbered, "::marker").color).toBe(
        mutedForeground,
      );
      expect(getComputedStyle(bulleted, "::marker").color).toBe(
        mutedForeground,
      );
    },
  );

  test.each(schemes)(
    "a caption is muted in %s",
    async (scheme, { mutedForeground }) => {
      const screen = await renderIn(scheme, ProseLesson, {});
      await expect
        .element(screen.getByText(/^A clearance with a hold short/))
        .toHaveStyle({ color: mutedForeground });
    },
  );
});
