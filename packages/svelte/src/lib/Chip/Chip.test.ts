import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { contrastOn, SURFACES } from "../../../test/contrast.ts";
import { renderIn } from "../../../test/schemes.ts";
import Chip from "./Chip.svelte";

const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

describe("Chip", () => {
  test("is a span holding its text, in mono", async () => {
    const screen = await renderIn("light", Chip, { children: text("HY") });
    const chip = screen.getByText("HY").element().parentElement!;
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
    const chip = screen.getByText("S3").element().parentElement!;
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
        const chip = screen.getByText("HY").element().parentElement!;
        expect(contrastOn(chip, background)).toBeGreaterThanOrEqual(4.5);
        expect(contrastOn(chip, card)).toBeGreaterThanOrEqual(4.5);
      },
    );
  });

  // Solid fills, so a tone's text reads the same on any surface.
  test.each(tones.filter((tone) => tone !== "muted"))(
    "the %s tone is white on a solid fill",
    async (tone) => {
      const screen = await renderIn("light", Chip, {
        tone,
        children: text("HY"),
      });
      const chip = screen.getByText("HY").element().parentElement!;
      await expect.element(chip).toHaveStyle({ color: "rgb(255, 255, 255)" });
      const { backgroundColor } = getComputedStyle(chip);
      expect(backgroundColor).not.toMatch(/\/|rgba|transparent/);
    },
  );

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Chip, {
      class: "ml-4",
      title: "Operating initials",
      children: text("HY"),
    });
    const chip = screen.getByText("HY").element().parentElement!;
    await expect.element(chip).toHaveAttribute("title", "Operating initials");
    await expect.element(chip).toHaveStyle({ marginLeft: "16px" });
  });
});
