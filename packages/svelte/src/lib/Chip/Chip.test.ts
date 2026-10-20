import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import {
  contrastOn,
  styleOfClasses,
  SURFACES,
} from "../../../test/contrast.ts";
import { renderIn } from "../../../test/schemes.ts";
import Chip from "./Chip.svelte";

const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

const chipOf = (code: Element) => code.parentElement!;

describe("Chip", () => {
  test("is a span holding its text, in mono", async () => {
    const screen = await renderIn("light", Chip, { children: text("HY") });
    const chip = chipOf(screen.getByText("HY").element());
    expect(chip.tagName).toBe("SPAN");
    await expect.element(chip).toHaveTextContent("HY");
    expect(getComputedStyle(chip).fontFamily).toMatch(/monospace/);
  });

  // The guide's `muted` fill and `foreground` text:
  // #E2E8F0 and #0F172A light, #334155 and #FFFFFF dark.
  test.each([
    ["light", "rgb(226, 232, 240)", "rgb(15, 23, 42)"],
    ["dark", "rgb(51, 65, 85)", "rgb(255, 255, 255)"],
    ["dark-header", "rgb(51, 65, 85)", "rgb(255, 255, 255)"],
  ] as const)("is muted by default in %s", async (scheme, fill, colour) => {
    const screen = await renderIn(scheme, Chip, { children: text("S3") });
    const chip = chipOf(screen.getByText("S3").element());
    await expect
      .element(chip)
      .toHaveStyle({ backgroundColor: fill, color: colour });
  });

  const tones = ["muted", "initials", "senior", "training", "team"] as const;
  const places = [
    ["light", SURFACES.light],
    ["dark", SURFACES.dark],
    ["dark-header", SURFACES.dark],
  ] as const;

  // WCAG 2.2 AA: 4.5:1 for text, on the page and on a card.
  describe.each(tones)("the %s tone", (tone) => {
    test.each(places)(
      "has 4.5:1 text in %s",
      async (scheme, { background, card }) => {
        const screen = await renderIn(scheme, Chip, {
          tone,
          children: text("HY"),
        });
        const chip = chipOf(screen.getByText("HY").element());
        expect(contrastOn(chip, background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastOn(chip, card)).toBeGreaterThanOrEqual(4.5);
      },
    );
  });

  // The community site's hues, made solid and, for amber and rose, one step
  // darker, so white passes on every surface. The same in every scheme.
  test.each([
    ["initials", "bg-indigo-600"],
    ["senior", "bg-amber-700"],
    ["training", "bg-rose-700"],
    ["team", "bg-slate-600"],
  ] as const)("the %s tone is white on %s", async (tone, fill) => {
    for (const scheme of ["light", "dark"] as const) {
      const screen = await renderIn(scheme, Chip, {
        tone,
        children: text(scheme),
      });
      const chip = chipOf(screen.getByText(scheme).element());
      await expect.element(chip).toHaveStyle({
        color: "rgb(255, 255, 255)",
        backgroundColor: styleOfClasses(fill, chip).backgroundColor,
      });
    }
  });

  test("shows an icon before its code, hidden from screen readers", async () => {
    const icon = createRawSnippet(() => ({
      render: () => `<svg data-testid="icon" viewBox="0 0 24 24"></svg>`,
    }));
    const screen = await renderIn("light", Chip, {
      tone: "training",
      icon,
      children: text("INS"),
    });
    const chip = chipOf(screen.getByText("INS").element());
    const svg = screen.getByTestId("icon").element();
    expect(chip.firstElementChild!.contains(svg)).toBe(true);
    expect(svg.closest("[aria-hidden='true']")).not.toBeNull();
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
