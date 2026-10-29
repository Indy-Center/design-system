import { mdiStar, mdiStarHalfFull, mdiStarOutline } from "@mdi/js";
import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import StarDisplay from "./StarDisplay.svelte";

/** The paths of the stars `image` draws, in order. */
const drawnIn = (image: Element) =>
  [...image.querySelectorAll("path")].map((path) => path.getAttribute("d"));

// Clamping, half stars and the words are stars.ts's, in
// stars.node.test.ts; the rounding to one decimal is StarDisplay's own.
describe("StarDisplay", () => {
  test.each([
    [4, "4 out of 5"],
    [4.333, "4.3 out of 5"],
    [7, "5 out of 5"],
  ])(
    "is an image named by %s in words, to one decimal, within 0 to 5: %s",
    async (value, name) => {
      const screen = await renderIn("light", StarDisplay, { value });
      await expect.element(screen.getByRole("img", { name })).toBeVisible();
    },
  );

  test("draws five stars to the nearest half star", async () => {
    const screen = await renderIn("light", StarDisplay, { value: 4.3 });
    expect(drawnIn(screen.getByRole("img").element())).toEqual([
      mdiStar,
      mdiStar,
      mdiStar,
      mdiStar,
      mdiStarHalfFull,
    ]);
  });

  // An average of no sessions is NaN.
  test("reads Not rated, with five outlines, for a value that isn't a number", async () => {
    const screen = await renderIn("light", StarDisplay, { value: NaN });
    const image = screen.getByRole("img", { name: "Not rated" });
    await expect.element(image).toBeVisible();
    expect(drawnIn(image.element())).toEqual(Array(5).fill(mdiStarOutline));
  });

  // The guide's roles: lit stars in `warning`, the rest in `muted-foreground`.
  test("colours the lit stars and the rest", async () => {
    const screen = await renderIn("light", StarDisplay, { value: 2.5 });
    const stars = screen.getByRole("img").element().querySelectorAll("svg");
    await expect
      .element(stars[1])
      .toHaveStyle({ color: role("warning", "light") });
    // The half star is lit: its empty half is the outline in the same colour.
    await expect
      .element(stars[2])
      .toHaveStyle({ color: role("warning", "light") });
    await expect
      .element(stars[3])
      .toHaveStyle({ color: role("muted-foreground", "light") });
  });

  test("passes class and other attributes to its element", async () => {
    const screen = await renderIn("light", StarDisplay, {
      value: 3,
      class: "mt-4",
      id: "teacher-average",
    });
    const image = screen.getByRole("img");
    await expect.element(image).toHaveStyle({ marginTop: "16px" });
    await expect.element(image).toHaveAttribute("id", "teacher-average");
  });

  test("takes a caller's aria-label over the words", async () => {
    const screen = await renderIn("light", StarDisplay, {
      value: 4.3,
      "aria-label": "Excellent, 4.3 out of 5",
    });
    await expect
      .element(screen.getByRole("img", { name: "Excellent, 4.3 out of 5" }))
      .toBeVisible();
  });
});
