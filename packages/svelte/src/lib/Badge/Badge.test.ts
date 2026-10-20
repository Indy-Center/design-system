import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { contrastOn, SURFACES } from "../../../test/contrast.ts";
import { renderIn } from "../../../test/schemes.ts";
import Badge from "./Badge.svelte";

const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

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

  const colours = [
    "sky",
    "purple",
    "green",
    "red",
    "orange",
    "yellow",
    "blue",
    "gray",
  ] as const;
  const places = [
    ["light", SURFACES.light],
    ["dark", SURFACES.dark],
    ["dark-header", SURFACES.dark],
  ] as const;

  // WCAG 2.2 AA: 4.5:1 for text, on the page and on a card.
  describe.each(colours)("in %s", (color) => {
    test.each(places)(
      "has 4.5:1 text in %s",
      async (scheme, { background, card }) => {
        const screen = await renderIn(scheme, Badge, {
          color,
          children: text("Draft"),
        });
        const badge = badgeOf(screen.getByText("Draft").element());
        expect(contrastOn(badge, background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastOn(badge, card)).toBeGreaterThanOrEqual(4.5);
      },
    );
  });

  // The guide: "In light, the tint is Tailwind's -600 step and the text its
  // -800; in dark, the tint is -500 and the text -300", the tint at 10%.
  test.each([
    ["light", "sky", "bg-sky-600/10 text-sky-800"],
    ["dark", "sky", "bg-sky-500/10 text-sky-300"],
    ["dark-header", "sky", "bg-sky-500/10 text-sky-300"],
    ["light", "gray", "bg-gray-600/10 text-gray-800"],
    ["dark", "gray", "bg-gray-500/10 text-gray-300"],
  ] as const)(
    "follows the guide's steps in %s for %s",
    async (scheme, color, guide) => {
      const screen = await renderIn(scheme, Badge, {
        color,
        children: text("Draft"),
      });
      const badge = badgeOf(screen.getByText("Draft").element());
      const probe = document.createElement("span");
      probe.className = guide;
      badge.parentElement!.append(probe);
      const expected = getComputedStyle(probe);
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
    const icon = createRawSnippet(() => ({
      render: () => `<svg data-testid="icon" viewBox="0 0 24 24"></svg>`,
    }));
    const screen = await renderIn("light", Badge, {
      icon,
      children: text("Member perk"),
    });
    const badge = badgeOf(screen.getByText("Member perk").element());
    const svg = screen.getByTestId("icon").element();
    expect(badge.firstElementChild!.contains(svg)).toBe(true);
    expect(svg.closest("[aria-hidden='true']")).not.toBeNull();
    await expect.element(badge).toHaveTextContent("Member perk");
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
    const probe = document.createElement("span");
    probe.className = "text-sky-800";
    badge.parentElement!.append(probe);
    await expect
      .element(badge)
      .toHaveStyle({ color: getComputedStyle(probe).color });
  });
});
