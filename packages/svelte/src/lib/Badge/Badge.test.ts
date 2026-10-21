import { describe, expect, test, vi } from "vitest";
import {
  expectReadable,
  SCHEMES,
  styleOfClasses,
} from "../../../test/contrast.ts";
import { renderIn } from "../../../test/schemes.ts";
import { expectLeadingHiddenIcon, icon, text } from "../../../test/snippets.ts";
import Badge, { BADGE_VARIANTS } from "./Badge.svelte";

const badgeOf = (label: Element) => label.parentElement!;

describe("Badge", () => {
  test("is a span holding its text", async () => {
    const screen = await renderIn("light", Badge, {
      children: text("Member perk"),
    });
    const badge = badgeOf(screen.getByText("Member perk").element());
    expect(badge.tagName).toBe("SPAN");
    await expect.element(badge).toHaveTextContent("Member perk");
  });

  describe.each(BADGE_VARIANTS)("in %s", (variant) => {
    test.each(SCHEMES)("has 4.5:1 text in %s", async (scheme) => {
      const screen = await renderIn(scheme, Badge, {
        variant,
        children: text("Draft"),
      });
      expectReadable(badgeOf(screen.getByText("Draft").element()), scheme);
    });

    test.each(SCHEMES)("has 4.5:1 text as a pill in %s", async (scheme) => {
      const screen = await renderIn(scheme, Badge, {
        variant,
        pill: true,
        children: text("Draft"),
      });
      expectReadable(badgeOf(screen.getByText("Draft").element()), scheme);
    });
  });

  // The guide: "In light, the tint is Tailwind's -600 step and the text its
  // -800; in dark, the tint is -500 and the text -300", the tint at 10%. A
  // status pill doubles the tint, as the community site's pills do.
  test.each([
    ["light", "sky", false, "bg-sky-600/10 text-sky-800"],
    ["dark", "sky", false, "bg-sky-500/10 text-sky-300"],
    ["dark-header", "sky", false, "bg-sky-500/10 text-sky-300"],
    ["light", "gray", false, "bg-gray-600/10 text-gray-800"],
    ["dark", "gray", false, "bg-gray-500/10 text-gray-300"],
    ["light", "green", true, "bg-green-600/20 text-green-800"],
    ["dark", "green", true, "bg-green-500/20 text-green-300"],
  ] as const)(
    "follows the guide's steps in %s for %s (pill: %s)",
    async (scheme, variant, pill, guide) => {
      const screen = await renderIn(scheme, Badge, {
        variant,
        pill,
        children: text("Draft"),
      });
      const badge = badgeOf(screen.getByText("Draft").element());
      const expected = styleOfClasses(guide, badge);
      await expect.element(badge).toHaveStyle({
        color: expected.color,
        backgroundColor: expected.backgroundColor,
      });
    },
  );

  // Tailwind's text-sm and text-xs, with their padding.
  test.each([
    ["md", "14px", "6px 12px"],
    ["sm", "12px", "4px 8px"],
  ] as const)("is %s size", async (size, fontSize, padding) => {
    const screen = await renderIn("light", Badge, {
      size,
      children: text("Draft"),
    });
    const badge = badgeOf(screen.getByText("Draft").element());
    await expect.element(badge).toHaveStyle({ fontSize, padding });
  });

  test("is md size by default", async () => {
    const screen = await renderIn("light", Badge, { children: text("Draft") });
    const badge = badgeOf(screen.getByText("Draft").element());
    await expect.element(badge).toHaveStyle({ fontSize: "14px" });
  });

  test("has rounded corners, or a pill's round ends for a status", async () => {
    const screen = await renderIn("light", Badge, {
      children: text("Draft"),
    });
    const badge = badgeOf(screen.getByText("Draft").element());
    await expect.element(badge).toHaveStyle({ borderRadius: "8px" });

    const pill = await renderIn("light", Badge, {
      pill: true,
      children: text("In progress"),
    });
    const round = badgeOf(pill.getByText("In progress").element());
    expect(parseFloat(getComputedStyle(round).borderRadius)).toBeGreaterThan(
      round.getBoundingClientRect().height / 2,
    );
  });

  test("shows an icon before its text, hidden from screen readers", async () => {
    const screen = await renderIn("light", Badge, {
      icon,
      children: text("Member perk"),
    });
    const badge = badgeOf(screen.getByText("Member perk").element());
    expectLeadingHiddenIcon(badge, screen.getByTestId("icon").element());
    await expect.element(badge).toHaveTextContent("Member perk");
  });

  test("warns while developing when it has no text", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await renderIn("light", Badge, { icon, children: text("") });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no text"));
    warn.mockRestore();
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Badge, {
      class: "ml-4",
      id: "perk",
      children: text("Member perk"),
    });
    const badge = badgeOf(screen.getByText("Member perk").element());
    await expect.element(badge).toHaveAttribute("id", "perk");
    await expect.element(badge).toHaveStyle({ marginLeft: "16px" });
  });

  test("is sky by default", async () => {
    const screen = await renderIn("light", Badge, { children: text("New") });
    const badge = badgeOf(screen.getByText("New").element());
    await expect
      .element(badge)
      .toHaveStyle({ color: styleOfClasses("text-sky-800", badge).color });
  });
});
