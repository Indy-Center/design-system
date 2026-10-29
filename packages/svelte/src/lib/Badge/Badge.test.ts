import { describe, expect, test, vi } from "vitest";
import { styleOfClasses } from "../../../test/contrast.ts";
import { renderIn } from "../../../test/schemes.ts";
import { expectLeadingHiddenIcon, icon, text } from "../../../test/snippets.ts";
import Badge, { BADGE_VARIANTS } from "./Badge.svelte";

const badgeOf = (label: Element) => label.parentElement!;

/**
 * Renders a badge and checks its text and tint, and its border if `steps`
 * gives one, against the guide's `steps`.
 */
async function expectSteps(
  scheme: "light" | "dark",
  props: { variant?: (typeof BADGE_VARIANTS)[number]; pill?: boolean },
  steps: string,
) {
  const screen = await renderIn(scheme, Badge, {
    ...props,
    children: text("Draft"),
  });
  const badge = badgeOf(screen.getByText("Draft").element());
  const { color, backgroundColor, borderColor } = styleOfClasses(steps, badge);
  await expect.element(badge).toHaveStyle({
    color,
    backgroundColor,
    ...(steps.includes("border-") && { borderColor }),
  });
}

// The guide's status-badge steps: in light the tint is the hue's -600 and
// the text its -800; in dark (Badge's `dark:` classes) -500 and -300. These
// steps pass 4.5:1 (the guide's), so readability needs no test of its own.
// Written out so Tailwind generates each class.
const guide = [
  ["sky", "light", "text-sky-800 bg-sky-600/10"],
  ["sky", "dark", "text-sky-300 bg-sky-500/10"],
  ["purple", "light", "text-purple-800 bg-purple-600/10"],
  ["purple", "dark", "text-purple-300 bg-purple-500/10"],
  ["green", "light", "text-green-800 bg-green-600/10"],
  ["green", "dark", "text-green-300 bg-green-500/10"],
  ["red", "light", "text-red-800 bg-red-600/10"],
  ["red", "dark", "text-red-300 bg-red-500/10"],
  ["orange", "light", "text-orange-800 bg-orange-600/10"],
  ["orange", "dark", "text-orange-300 bg-orange-500/10"],
  ["yellow", "light", "text-yellow-800 bg-yellow-600/10"],
  ["yellow", "dark", "text-yellow-300 bg-yellow-500/10"],
  ["blue", "light", "text-blue-800 bg-blue-600/10"],
  ["blue", "dark", "text-blue-300 bg-blue-500/10"],
  ["gray", "light", "text-gray-800 bg-gray-600/10"],
  ["gray", "dark", "text-gray-300 bg-gray-500/10"],
] as const;

describe("Badge", () => {
  test("pins every variant to the guide in both schemes", () => {
    expect(guide.map(([variant, scheme]) => `${variant} ${scheme}`)).toEqual(
      BADGE_VARIANTS.flatMap((variant) => [
        `${variant} light`,
        `${variant} dark`,
      ]),
    );
  });

  test.each(guide)(
    "follows the guide's steps for %s in %s",
    async (variant, scheme, steps) => {
      await expectSteps(scheme, { variant }, steps);
    },
  );

  // A badge has a 30% border on its 10% tint; a status pill doubles the
  // tint and takes a 50% border, as the community site's pills do. The
  // border is the tint's hue and the amounts are the same for every hue,
  // so one hue is enough.
  test.each([
    ["light", false, "text-green-800 bg-green-600/10 border-green-600/30"],
    ["light", true, "text-green-800 bg-green-600/20 border-green-600/50"],
    ["dark", false, "text-green-300 bg-green-500/10 border-green-500/30"],
    ["dark", true, "text-green-300 bg-green-500/20 border-green-500/50"],
  ] as const)(
    "has the guide's tint and border in %s (pill: %s)",
    async (scheme, pill, steps) => {
      await expectSteps(scheme, { variant: "green", pill }, steps);
    },
  );

  test("is sky and md size by default", async () => {
    const screen = await renderIn("light", Badge, { children: text("New") });
    const badge = badgeOf(screen.getByText("New").element());
    await expect.element(badge).toHaveStyle({
      color: styleOfClasses("text-sky-800", badge).color,
      fontSize: "14px",
    });
  });

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
});
