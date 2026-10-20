import { describe, expect, test } from "vitest";
import { renderIn } from "../../../test/schemes.ts";
import Icon from "./Icon.svelte";

// `mdiAirplane` from @mdi/js.
const airplane =
  "M20.56 3.91C21.15 4.5 21.15 5.45 20.56 6.03L16.67 9.92L18.79 19.11L17.38 20.53L13.5 13.1L9.6 17L9.96 19.47L8.89 20.53L7.13 17.35L3.94 15.58L5 14.5L7.5 14.87L11.37 11L3.94 7.09L5.36 5.68L14.55 7.8L18.44 3.91C19 3.33 20 3.33 20.56 3.91Z";

describe("Icon", () => {
  test("is hidden from screen readers without a label", async () => {
    const screen = await renderIn("light", Icon, { path: airplane });
    const svg = screen.container.querySelector("svg");
    await expect.element(svg).toHaveAttribute("aria-hidden", "true");
    await expect.element(svg).not.toHaveAttribute("role");
  });

  test("is an image named by its label", async () => {
    const screen = await renderIn("light", Icon, {
      path: airplane,
      label: "Departures",
    });
    const img = screen.getByRole("img", { name: "Departures" });
    await expect.element(img).not.toHaveAttribute("aria-hidden");
  });

  test("draws the path it's given", async () => {
    const screen = await renderIn("light", Icon, { path: airplane });
    const path = screen.container.querySelector<SVGElement>("svg path");
    await expect.element(path).toHaveAttribute("d", airplane);
  });

  test("is 1em square by default, and the size it's given", async () => {
    const screen = await renderIn("light", Icon, { path: airplane });
    await expect
      .element(screen.container.querySelector("svg"))
      .toHaveStyle({ width: "16px", height: "16px" });

    const sized = await renderIn("light", Icon, { path: airplane, size: 32 });
    await expect
      .element(sized.container.querySelector("svg"))
      .toHaveStyle({ width: "32px", height: "32px" });
  });

  test("fills with the text colour around it", async () => {
    const screen = await renderIn("light", Icon, {
      path: airplane,
      style: "color: rgb(185, 28, 28)",
    });
    await expect
      .element(screen.container.querySelector<SVGElement>("svg path"))
      .toHaveStyle({ fill: "rgb(185, 28, 28)" });
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Icon, {
      path: airplane,
      class: "ml-4",
      id: "plane",
    });
    const svg = screen.container.querySelector("svg");
    await expect.element(svg).toHaveAttribute("id", "plane");
    await expect.element(svg).toHaveStyle({ marginLeft: "16px" });
  });
});
