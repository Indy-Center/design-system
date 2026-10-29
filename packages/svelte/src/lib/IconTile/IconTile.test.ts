import { describe, expect, test } from "vitest";
import { translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { icon } from "../../../test/snippets.ts";
import IconTile from "./IconTile.svelte";

// ErrorPage, EmptyState and StatCard each test that their tile is wired in;
// its looks are tested here. IconTile has no `dark:` code: its colours are
// roles, so they're tested in light.
describe("IconTile", () => {
  test.each([
    [
      "primary",
      translucent(role("primary", "light"), 15),
      role("link", "light"),
    ],
    ["muted", role("muted", "light"), role("muted-foreground", "light")],
  ] as const)(
    "in the %s tone, has its fill and icon colour",
    async (tone, backgroundColor, color) => {
      const screen = await renderIn("light", IconTile, {
        tone,
        shape: "circle",
        children: icon,
      });
      const tile = screen.getByTestId("icon").element().parentElement!;
      await expect.element(tile).toHaveStyle({ backgroundColor, color });
    },
  );

  test("is a circle, or a square with rounded corners", async () => {
    const circle = await renderIn("light", IconTile, {
      tone: "muted",
      shape: "circle",
      class: "size-16",
      children: icon,
    });
    const round = circle.getByTestId("icon").element().parentElement!;
    expect(
      parseFloat(getComputedStyle(round).borderRadius),
    ).toBeGreaterThanOrEqual(round.getBoundingClientRect().height / 2);

    const square = await renderIn("light", IconTile, {
      tone: "primary",
      shape: "square",
      children: icon,
    });
    await expect
      .element(square.getByTestId("icon").element().parentElement!)
      .toHaveStyle({ borderRadius: "8px" });
  });

  test("hides itself and its icon from screen readers", async () => {
    const screen = await renderIn("light", IconTile, {
      tone: "primary",
      shape: "circle",
      children: icon,
    });
    const tile = screen.getByTestId("icon").element().parentElement!;
    await expect.element(tile).toHaveAttribute("aria-hidden", "true");
  });

  // The caller sets its size and spacing.
  test("takes a caller's class", async () => {
    const screen = await renderIn("light", IconTile, {
      tone: "muted",
      shape: "circle",
      class: "mb-4 size-16",
      children: icon,
    });
    const tile = screen.getByTestId("icon").element().parentElement!;
    await expect
      .element(tile)
      .toHaveStyle({ width: "64px", height: "64px", marginBottom: "16px" });
  });
});
