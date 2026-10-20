import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import ProgressBar from "./ProgressBar.svelte";

/**
 * The colour drawn at `across` (0 to 1) along `element`'s middle, as
 * `rgb(…)`. The bar's fill is a browser pseudo-element that
 * `getComputedStyle` can't read, so this reads the pixels.
 */
async function colourAt(element: Element, across: number): Promise<string> {
  const base64 = await page.screenshot({ element, save: false });
  const image = await createImageBitmap(
    await (await fetch(`data:image/png;base64,${base64}`)).blob(),
  );
  const canvas = new OffscreenCanvas(image.width, image.height);
  const context = canvas.getContext("2d")!;
  context.drawImage(image, 0, 0);
  const [r, g, b] = context.getImageData(
    Math.floor(image.width * across),
    Math.floor(image.height / 2),
    1,
    1,
  ).data;
  return `rgb(${r}, ${g}, ${b})`;
}

describe("ProgressBar", () => {
  test("is a progress bar named by its label", async () => {
    const screen = await renderIn("light", ProgressBar, {
      label: "Course progress",
      value: 40,
    });
    await expect
      .element(screen.getByRole("progressbar", { name: "Course progress" }))
      .toBeVisible();
    await expect.element(screen.getByText("Course progress")).toBeVisible();
  });

  test("says how far along it is as a percentage, to readers and on screen", async () => {
    const screen = await renderIn("light", ProgressBar, {
      label: "Course progress",
      value: 40,
    });
    const bar = screen.getByRole("progressbar");
    await expect.element(bar).toHaveAttribute("value", "40");
    await expect.element(bar).toHaveAttribute("max", "100");
    await expect.element(bar).toHaveAttribute("aria-valuetext", "40%");
    await expect.element(screen.getByText("40%")).toBeVisible();
  });

  test("counts against its max", async () => {
    const screen = await renderIn("light", ProgressBar, {
      label: "Lessons",
      value: 3,
      max: 8,
    });
    const bar = screen.getByRole("progressbar");
    await expect.element(bar).toHaveAttribute("max", "8");
    await expect.element(bar).toHaveAttribute("aria-valuetext", "38%");
  });

  test("says the value text it's given instead", async () => {
    const screen = await renderIn("light", ProgressBar, {
      label: "Lessons",
      value: 3,
      max: 8,
      valueText: "3 of 8 lessons",
    });
    await expect
      .element(screen.getByRole("progressbar"))
      .toHaveAttribute("aria-valuetext", "3 of 8 lessons");
    await expect.element(screen.getByText("3 of 8 lessons")).toBeVisible();
  });

  // The bar already says its value; the words beside it are for the eye.
  test("says the value to readers once", async () => {
    const screen = await renderIn("light", ProgressBar, {
      label: "Course progress",
      value: 40,
    });
    await expect
      .element(screen.getByText("40%"))
      .toHaveAttribute("aria-hidden", "true");
  });

  // From the brand guide's Roles table: the track is `muted`, the fill
  // `info` (`primary` is too faint on the dark track), the label
  // `foreground-soft` and the value `muted-foreground`.
  const colours = {
    light: {
      track: "rgb(226, 232, 240)",
      fill: "rgb(3, 105, 161)",
      label: "rgb(51, 65, 85)",
      value: "rgb(71, 85, 105)",
    },
    dark: {
      track: "rgb(51, 65, 85)",
      fill: "rgb(56, 189, 248)",
      label: "rgb(209, 213, 219)",
      value: "rgb(156, 163, 175)",
    },
  };
  for (const scheme of ["light", "dark", "dark-header"] as const) {
    const expected = colours[scheme === "light" ? "light" : "dark"];
    test(`takes its colours from the roles in ${scheme}`, async () => {
      const screen = await renderIn(scheme, ProgressBar, {
        label: "Course progress",
        value: 40,
      });
      const bar = screen.getByRole("progressbar").element();
      // The fill covers the first 40%; the track shows past it.
      expect(await colourAt(bar, 0.2)).toBe(expected.fill);
      expect(await colourAt(bar, 0.7)).toBe(expected.track);
      await expect
        .element(screen.getByText("Course progress"))
        .toHaveStyle({ color: expected.label });
      await expect
        .element(screen.getByText("40%"))
        .toHaveStyle({ color: expected.value });
    });
  }

  test("is a rounded bar 8px tall, as wide as its place", async () => {
    const screen = await renderIn("light", ProgressBar, {
      label: "Course progress",
      value: 40,
      style: "width: 300px",
    });
    const bar = screen.getByRole("progressbar");
    await expect.element(bar).toHaveStyle({ height: "8px", width: "300px" });
    await expect
      .element(bar)
      .toHaveStyle({ borderRadius: "calc(infinity * 1px)" });
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", ProgressBar, {
      label: "Course progress",
      value: 40,
      class: "mt-4",
      id: "progress",
    });
    const root = screen.container.querySelector<HTMLElement>("#progress");
    await expect.element(root).toHaveStyle({ marginTop: "16px" });
    await expect.element(root!.querySelector("progress")).toBeInTheDocument();
  });

  test("keeps the words within 0% and 100%", async () => {
    const over = await renderIn("light", ProgressBar, {
      label: "Over",
      value: 12,
      max: 10,
    });
    await expect.element(over.getByText("100%")).toBeVisible();
    const under = await renderIn("light", ProgressBar, {
      label: "Under",
      value: -2,
    });
    await expect.element(under.getByText("0%")).toBeVisible();
  });
});
