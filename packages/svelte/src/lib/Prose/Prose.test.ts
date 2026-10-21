import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
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

  // Heading's looks: h2 xl, h3 lg, h4 base, semibold in the heading font.
  test("headings are Heading's size for their level", async () => {
    const screen = await renderIn("light", ProseLesson, {});
    for (const [level, name, size] of [
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
});
