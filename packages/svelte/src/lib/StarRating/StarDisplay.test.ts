import { mdiStar, mdiStarHalfFull, mdiStarOutline } from "@mdi/js";
import { describe, expect, test } from "vitest";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import StarDisplay from "./StarDisplay.svelte";

describe("StarDisplay", () => {
  test("is an image named by the value in words", async () => {
    const screen = await renderIn("light", StarDisplay, { value: 4 });
    await expect
      .element(screen.getByRole("img", { name: "4 out of 5" }))
      .toBeVisible();
  });

  test.each([
    [4.333, "4.3 out of 5"],
    [4.25, "4.3 out of 5"],
    [0, "0 out of 5"],
    [5, "5 out of 5"],
    [7, "5 out of 5"],
    [-1, "0 out of 5"],
  ])("reads %s to one decimal, within 0 to 5: %s", async (value, name) => {
    const screen = await renderIn("light", StarDisplay, { value });
    await expect.element(screen.getByRole("img", { name })).toBeVisible();
  });

  test.each([
    [4.3, [mdiStar, mdiStar, mdiStar, mdiStar, mdiStarHalfFull]],
    [4.2, [mdiStar, mdiStar, mdiStar, mdiStar, mdiStarOutline]],
  ])("draws %s to the nearest half star", async (value, paths) => {
    const screen = await renderIn("light", StarDisplay, { value });
    const drawn = [
      ...screen.getByRole("img").element().querySelectorAll("path"),
    ].map((path) => path.getAttribute("d"));
    expect(drawn).toEqual(paths);
  });

  // An average of no sessions is NaN.
  test("reads Not rated, with five outlines, for a value that isn't a number", async () => {
    const screen = await renderIn("light", StarDisplay, { value: NaN });
    const image = screen.getByRole("img", { name: "Not rated" });
    await expect.element(image).toBeVisible();
    const drawn = [...image.element().querySelectorAll("path")].map((path) =>
      path.getAttribute("d"),
    );
    expect(drawn).toEqual(Array(5).fill(mdiStarOutline));
  });

  test("draws five stars, none of them read on their own", async () => {
    const screen = await renderIn("light", StarDisplay, { value: 3 });
    const image = screen.getByRole("img").element();
    expect(image.querySelectorAll("svg")).toHaveLength(5);
    for (const svg of image.querySelectorAll("svg")) {
      expect(svg).toHaveAttribute("aria-hidden", "true");
    }
  });

  // The guide's roles: lit stars in `warning`, the rest in `muted-foreground`.
  test.each(SCHEMES)(
    "colours the lit stars and the rest in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, StarDisplay, { value: 2.5 });
      const stars = screen.getByRole("img").element().querySelectorAll("svg");
      await expect
        .element(stars[1])
        .toHaveStyle({ color: role("warning", scheme) });
      // The half star is lit: its empty half is the outline in the same colour.
      await expect
        .element(stars[2])
        .toHaveStyle({ color: role("warning", scheme) });
      await expect
        .element(stars[3])
        .toHaveStyle({ color: role("muted-foreground", scheme) });
    },
  );

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
