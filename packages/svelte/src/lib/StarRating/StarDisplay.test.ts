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
    [4.3, "4.5 out of 5"],
    [4.2, "4 out of 5"],
    [0, "0 out of 5"],
    [5, "5 out of 5"],
  ])("rounds %s to the nearest half star: %s", async (value, name) => {
    const screen = await renderIn("light", StarDisplay, { value });
    await expect.element(screen.getByRole("img", { name })).toBeVisible();
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
});
