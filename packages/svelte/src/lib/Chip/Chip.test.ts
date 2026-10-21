import { describe, expect, test } from "vitest";
import {
  expectReadable,
  SCHEMES,
  styleOfClasses,
} from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { expectLeadingHiddenIcon, icon, text } from "../../../test/snippets.ts";
import Chip, { CHIP_VARIANTS } from "./Chip.svelte";

const chipOf = (code: Element) => code.parentElement!;

describe("Chip", () => {
  test("is a span holding its text, in mono", async () => {
    const screen = await renderIn("light", Chip, { children: text("HY") });
    const chip = chipOf(screen.getByText("HY").element());
    expect(chip.tagName).toBe("SPAN");
    await expect.element(chip).toHaveTextContent("HY");
    expect(getComputedStyle(chip).fontFamily).toMatch(/monospace/);
  });

  // The guide's `muted` fill and `foreground` text.
  test.each(SCHEMES)("is muted by default in %s", async (scheme) => {
    const screen = await renderIn(scheme, Chip, { children: text("S3") });
    const chip = chipOf(screen.getByText("S3").element());
    await expect.element(chip).toHaveStyle({
      backgroundColor: role("muted", scheme),
      color: role("foreground", scheme),
    });
  });

  describe.each(CHIP_VARIANTS)("the %s variant", (variant) => {
    test.each(SCHEMES)("has 4.5:1 text in %s", async (scheme) => {
      const screen = await renderIn(scheme, Chip, {
        variant,
        children: text("HY"),
      });
      expectReadable(chipOf(screen.getByText("HY").element()), scheme);
    });
  });

  // The community site's hues, made solid and, for amber, rose and emerald,
  // one step darker, so white passes on every surface. The same in every
  // scheme.
  test.each([
    ["initials", "bg-indigo-600"],
    ["senior", "bg-amber-700"],
    ["training", "bg-rose-700"],
    ["team", "bg-slate-600"],
    ["certification", "bg-emerald-700"],
  ] as const)("the %s variant is white on %s", async (variant, fill) => {
    for (const scheme of ["light", "dark"] as const) {
      const screen = await renderIn(scheme, Chip, {
        variant,
        children: text(scheme),
      });
      const chip = chipOf(screen.getByText(scheme).element());
      await expect.element(chip).toHaveStyle({
        color: role("white", scheme),
        backgroundColor: styleOfClasses(fill, chip).backgroundColor,
      });
    }
  });

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
