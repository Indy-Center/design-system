import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { lessonHtml } from "../../playground/lesson.ts";
import { richHtml } from "../../playground/proseMarkup.ts";
import ProseLesson from "./Prose.test.svelte";

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
    const body = screen.container.querySelector<HTMLElement>("#body")!;
    await expect.element(body).toHaveStyle({
      marginTop: "32px",
      color: role("foreground-soft", "light"),
    });
  });

  // prose-centerline sets the plugin's colours to roles and has no rule of
  // its own for dark, so the colours are tested in light.
  test("draws every element in the roles", async () => {
    const screen = await renderIn("light", ProseLesson, {});
    const foreground = role("foreground", "light");
    const muted = role("muted", "light");
    const mutedForeground = role("muted-foreground", "light");

    await expect
      .element(screen.getByText(/^A taxi clearance gives/))
      .toHaveStyle({ color: role("foreground-soft", "light") });
    await expect
      .element(screen.getByRole("link", { name: "FAA 7110.65" }))
      .toHaveStyle({ color: role("link", "light") });
    await expect
      .element(screen.getByRole("heading", { name: "Taxi clearances" }))
      .toHaveStyle({ color: foreground });

    // The table head is muted, with no heavier rule.
    const head = screen.getByText("Mistake", { exact: true });
    await expect.element(head).toHaveStyle({ color: foreground });
    await expect.element(head.element().closest("thead")!).toHaveStyle({
      backgroundColor: muted,
      borderBottomColor: role("border", "light"),
    });

    // Inline code is a muted chip, with no backticks.
    const code = screen.getByText("KXMP");
    await expect
      .element(code)
      .toHaveStyle({ color: foreground, backgroundColor: muted });
    expectNoMarks(code.element());

    // A code block is on muted.
    const block = screen.getByText(/^N123AB, runway 27/);
    await expect.element(block).toHaveStyle({ color: foreground });
    await expect
      .element(block.element().closest("pre")!)
      .toHaveStyle({ backgroundColor: muted });

    // A quote has the sky rule (the info role), upright, with no marks.
    const quoted = screen.getByText(/^An aircraft must not cross/);
    await expect.element(quoted.element().closest("blockquote")!).toHaveStyle({
      borderInlineStartColor: role("info", "light"),
      fontStyle: "normal",
    });
    expectNoMarks(quoted.element());

    // List numbers and bullets are muted. toHaveStyle can't read a
    // pseudo-element, so these read ::marker.
    for (const item of [
      screen.getByText("Call sign.").element(),
      screen.getByText(/^Open the field diagram/).element(),
    ]) {
      expect(getComputedStyle(item, "::marker").color).toBe(mutedForeground);
    }

    await expect
      .element(screen.getByText(/^A clearance with a hold short/))
      .toHaveStyle({ color: mutedForeground });
  });

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

  test("a link shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", ProseLesson, {});
    await userEvent.tab();
    const link = screen.getByRole("link", { name: "FAA 7110.65" });
    await expect.element(link).toHaveFocus();
    await expect.element(link).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  // Heading's looks: h1 3xl, h2 xl, h3 lg, h4 base, semibold in the
  // heading font. The lesson starts at h2, as the doc page asks; an h1 is
  // added for the one size it lacks.
  test("headings are Heading's size for their level", async () => {
    const screen = await renderIn("light", ProseLesson, {
      html: `<h1>Ground lesson</h1>${lessonHtml}`,
    });
    for (const [level, name, size] of [
      [1, "Ground lesson", "30px"],
      [2, "Taxi clearances", "20px"],
      [3, "Phraseology", "18px"],
      [4, "Readbacks", "16px"],
    ] as const) {
      const heading = screen.getByRole("heading", { level, name });
      await expect
        .element(heading)
        .toHaveStyle({ fontSize: size, fontWeight: "600" });
      expect(getComputedStyle(heading.element()).fontFamily).toMatch(
        /^"Source Sans 3",/,
      );
    }
  });

  // An app's own component inside the body (a Card, a Button) sits in
  // not-prose, so neither the plugin nor prose-centerline styles it.
  test("leaves what is inside not-prose alone", async () => {
    const screen = await renderIn("light", ProseLesson, {
      html: `<div class="not-prose"><h2>Book a session</h2><a href="#book">Book</a></div>`,
    });
    await expect
      .element(screen.getByRole("heading", { name: "Book a session" }))
      .toHaveStyle({ fontSize: "16px", fontWeight: "400" });
    await expect
      .element(screen.getByRole("link", { name: "Book" }))
      .toHaveStyle({
        color: role("foreground-soft", "light"),
        textDecorationLine: "none",
      });
  });
});

// What RichText writes beyond the lesson (playground/proseMarkup.ts).
describe("Prose, rich text", () => {
  test("underline is in the text colour, not the link's; strike is struck", async () => {
    const screen = await renderIn("light", ProseLesson, { html: richHtml });
    const underlined = screen.getByText("underlined", { exact: true });
    await expect.element(underlined).toHaveStyle({
      color: role("foreground-soft", "light"),
      textDecorationLine: "underline",
    });
    await expect
      .element(screen.getByText("struck through", { exact: true }))
      .toHaveStyle({ textDecorationLine: "line-through" });
  });

  test.each([
    ["A centred paragraph", "center"],
    ["A paragraph aligned to the end", "end"],
    ["A justified paragraph", "justify"],
  ])("%s is aligned %s", async (start, align) => {
    const screen = await renderIn("light", ProseLesson, { html: richHtml });
    await expect
      .element(screen.getByText(new RegExp(`^${start}`)))
      .toHaveStyle({ textAlign: align });
  });

  test("a checklist has no bullet, and the box sits beside its label's first line", async () => {
    const screen = await renderIn("light", ProseLesson, { html: richHtml });
    const box = screen.getByRole("checkbox", { name: /^Load the sector file/ });
    const item = box.element().closest("li")!;
    await expect.element(item).toHaveStyle({ listStyleType: "none" });
    expect(getComputedStyle(item.parentElement!).paddingInlineStart).toBe(
      "0px",
    );
    const label = box.element().closest("label")!;
    const boxRect = box.element().getBoundingClientRect();
    const labelRect = label.getBoundingClientRect();
    // At the label's start, and level with the first line of its text.
    expect(boxRect.left).toBe(labelRect.left);
    expect(boxRect.top - labelRect.top).toBeLessThan(20);
    const range = document.createRange();
    range.selectNodeContents(label.lastChild!);
    expect(range.getClientRects()[0].left).toBeGreaterThan(boxRect.right);
    expect(labelRect.height).toBeGreaterThanOrEqual(44);
  });

  test("a checkbox ticks from its label", async () => {
    const screen = await renderIn("light", ProseLesson, { html: richHtml });
    const box = screen.getByRole("checkbox", { name: /^Join the voice/ });
    await expect.element(box).not.toBeChecked();
    await userEvent.click(screen.getByText("Join the voice channel"));
    await expect.element(box).toBeChecked();
  });

  test("tables: role borders, a head in foreground, a side head", async () => {
    const screen = await renderIn("light", ProseLesson, { html: richHtml });
    const side = screen.getByRole("rowheader", { name: "Ground" });
    await expect.element(side).toHaveStyle({
      color: role("foreground", "light"),
      fontWeight: "600",
      textAlign: "start",
    });
    const row = side.element().closest("tr")!;
    expect(getComputedStyle(row).borderBottomColor).toBe(
      role("border", "light"),
    );
    await expect
      .element(screen.getByRole("columnheader", { name: "Frequency" }))
      .toHaveStyle({ color: role("foreground", "light") });
    // The merged cell spans two columns.
    const merged = screen.getByRole("cell", { name: /^Combined with Ground/ });
    expect(merged.element().getAttribute("colspan")).toBe("2");
  });

  test("a wide table scrolls in its own box", async () => {
    const screen = await renderIn("light", ProseLesson, {
      html: richHtml,
      class: "w-64",
    });
    const table = screen
      .getByRole("columnheader", { name: "Closed hours" })
      .element()
      .closest("table")!;
    expect(getComputedStyle(table).overflowX).toBe("auto");
    expect(table.scrollWidth).toBeGreaterThan(table.clientWidth);
    expect(table.clientWidth).toBeLessThanOrEqual(256);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth,
    );
  });

  test("a new-tab link has a mark after its text, with alternative text", async () => {
    const screen = await renderIn("light", ProseLesson, { html: richHtml });
    const link = screen.getByText("to a new tab", { exact: true }).element();
    const after = getComputedStyle(link, "::after");
    expect(after.content).toContain("opens in a new tab");
    expect(after.display).toBe("inline-block");
    expect(after.backgroundColor).toBe(role("link", "light"));
    // Other links have none.
    const inside = screen.getByRole("link", { name: "inside the site" });
    expect(getComputedStyle(inside.element(), "::after").content).toBe("none");
  });
});
