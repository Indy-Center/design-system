import { describe, expect, test } from "vitest";
import { styleOfClasses, translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { expectLeadingHiddenIcon, icon, text } from "../../../test/snippets.ts";
import Chip from "./Chip.svelte";

const chipOf = (code: Element) => code.parentElement!;

// Every variant is pinned to its fill and text below. Chip has no `dark:`
// code: the solid fills are the same in every scheme and the tints follow
// their roles, so each is tested in light. Their readability is the
// guide's: white passes 4.5:1 on each solid, and foreground on each tint.
describe("Chip", () => {
  test("holds its text, in mono", async () => {
    const screen = await renderIn("light", Chip, { children: text("HY") });
    const chip = chipOf(screen.getByText("HY").element());
    await expect.element(chip).toHaveTextContent("HY");
    expect(getComputedStyle(chip).fontFamily).toMatch(/monospace/);
  });

  // The guide's `muted` fill and `foreground` text.
  test("is muted by default", async () => {
    const screen = await renderIn("light", Chip, { children: text("S3") });
    const chip = chipOf(screen.getByText("S3").element());
    await expect.element(chip).toHaveStyle({
      backgroundColor: role("muted", "light"),
      color: role("foreground", "light"),
    });
  });

  // The community site's hues, made solid and, for amber, rose and emerald,
  // one step darker, so white passes on every surface.
  test.each([
    ["initials", "bg-indigo-600"],
    ["senior", "bg-amber-700"],
    ["training", "bg-rose-700"],
    ["team", "bg-slate-600"],
    ["certification", "bg-emerald-700"],
  ] as const)("the %s variant is white on %s", async (variant, fill) => {
    const screen = await renderIn("light", Chip, {
      variant,
      children: text("HY"),
    });
    const chip = chipOf(screen.getByText("HY").element());
    await expect.element(chip).toHaveStyle({
      color: role("white", "light"),
      backgroundColor: styleOfClasses(fill, chip).backgroundColor,
    });
  });

  // Credential's kinds that aren't certifications: a tint of the role, so
  // they follow the scheme. The text is `foreground`: `info` and `warning`
  // text fall short of 4.5:1 on their own tint in light.
  test.each([
    ["endorsement", "info"],
    ["solo", "warning"],
  ] as const)(
    "the %s variant is foreground on a %s tint",
    async (variant, tint) => {
      const screen = await renderIn("light", Chip, {
        variant,
        children: text("S-LC"),
      });
      const chip = chipOf(screen.getByText("S-LC").element());
      await expect.element(chip).toHaveStyle({
        color: role("foreground", "light"),
        backgroundColor: translucent(role(tint, "light"), 20),
      });
    },
  );

  test("shows an icon before its code, hidden from screen readers", async () => {
    const screen = await renderIn("light", Chip, {
      variant: "training",
      icon,
      children: text("INS"),
    });
    const chip = chipOf(screen.getByText("INS").element());
    expectLeadingHiddenIcon(chip, screen.getByTestId("icon").element());
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Chip, {
      class: "ml-4",
      title: "Operating initials",
      children: text("HY"),
    });
    const chip = chipOf(screen.getByText("HY").element());
    await expect.element(chip).toHaveAttribute("title", "Operating initials");
    await expect.element(chip).toHaveStyle({ marginLeft: "16px" });
  });
});
