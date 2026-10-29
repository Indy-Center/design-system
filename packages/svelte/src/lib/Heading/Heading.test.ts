import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import Heading from "./Heading.svelte";

describe("Heading", () => {
  test.each([
    [1, 4],
    [3, "label"],
  ] as const)(
    "is a heading at level %i, even in look %s",
    async (level, look) => {
      const screen = await renderIn("light", Heading, {
        level,
        look,
        children: text("Upcoming events"),
      });
      await expect
        .element(
          screen.getByRole("heading", { name: "Upcoming events", level }),
        )
        .toBeInTheDocument();
    },
  );

  // Sizes chosen in ticket 10: h1 3xl, h2 xl, h3 lg, h4 base (Tailwind's
  // 30, 20, 18 and 16px), all semibold in Source Sans 3.
  test.each([
    [3, 1, "30px"],
    [1, 2, "20px"],
    [2, 3, "18px"],
    [2, 4, "16px"],
  ] as const)(
    "at level %i in look %i is %s semibold in the heading font",
    async (level, look, size) => {
      const screen = await renderIn("light", Heading, {
        level,
        look,
        children: text("Upcoming events"),
      });
      const heading = screen.getByRole("heading");
      await expect.element(heading).toHaveStyle({
        fontSize: size,
        fontWeight: "600",
      });
      expect(getComputedStyle(heading.element()).fontFamily).toMatch(
        /^"Source Sans 3"/,
      );
    },
  );

  // Without a look, a level takes its own look; h5 and h6 take h4's.
  test.each([
    [1, "30px"],
    [3, "18px"],
    [6, "16px"],
  ] as const)("at level %i without a look is %s", async (level, size) => {
    const screen = await renderIn("light", Heading, {
      level,
      children: text("Upcoming events"),
    });
    await expect
      .element(screen.getByRole("heading"))
      .toHaveStyle({ fontSize: size });
  });

  // The section label chosen in ticket 10: uppercase xs semibold, wider
  // tracking (0.05em of 12px), in the body font, not the heading font.
  test("in the label look is small uppercase body text", async () => {
    const screen = await renderIn("light", Heading, {
      level: 2,
      look: "label",
      children: text("Upcoming events"),
    });
    const heading = screen.getByRole("heading", { level: 2 });
    await expect.element(heading).toHaveStyle({
      fontSize: "12px",
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: "0.6px",
    });
    expect(getComputedStyle(heading.element()).fontFamily).toMatch(
      /^ui-sans-serif/,
    );
  });

  // The guide's roles: `foreground` for the sized looks, `muted-foreground`
  // for label.
  test.each([
    [2, "foreground"],
    ["label", "muted-foreground"],
  ] as const)("in look %s is %s", async (look, colour) => {
    const screen = await renderIn("light", Heading, {
      level: 2,
      look,
      children: text("Upcoming events"),
    });
    await expect
      .element(screen.getByRole("heading"))
      .toHaveStyle({ color: role(colour, "light") });
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Heading, {
      level: 2,
      id: "events",
      class: "mt-6",
      children: text("Upcoming events"),
    });
    const heading = screen.getByRole("heading");
    await expect.element(heading).toHaveAttribute("id", "events");
    await expect
      .element(heading)
      .toHaveStyle({ marginTop: "24px", fontSize: "20px" });
  });
});
