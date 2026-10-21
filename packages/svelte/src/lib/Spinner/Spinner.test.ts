import { afterEach, describe, expect, test } from "vitest";
import { commands } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Spinner from "./Spinner.svelte";

afterEach(() => commands.emulateReducedMotion(null));

describe("Spinner", () => {
  test('is a status that says "Loading"', async () => {
    const screen = await renderIn("light", Spinner, {});
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Loading");
  });

  test("says the label it's given", async () => {
    const screen = await renderIn("light", Spinner, { label: "Saving" });
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Saving");
  });

  // Readers announce a live region's text when it changes, not always when
  // the region arrives with it, so the label goes in after the region.
  test("puts its label into the status after the status is on the page", async () => {
    const changes: MutationRecord[] = [];
    const observer = new MutationObserver((records) =>
      changes.push(...records),
    );
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    const screen = await renderIn("light", Spinner, {});
    const status = screen.getByRole("status").element();
    await expect.element(status).toHaveTextContent("Loading");
    observer.disconnect();
    const insideStatus = changes.filter(
      (c) => c.target !== status.parentNode && status.contains(c.target),
    );
    expect(insideStatus).not.toEqual([]);
  });

  test("shows the label to screen readers only", async () => {
    const screen = await renderIn("light", Spinner, {});
    await expect.element(screen.getByText("Loading")).toHaveStyle({
      position: "absolute",
      width: "1px",
      height: "1px",
    });
  });

  test("spins", async () => {
    const screen = await renderIn("light", Spinner, {});
    const svg = screen.container.querySelector("svg");
    await expect.element(svg).toHaveAttribute("aria-hidden", "true");
    await expect.element(svg).toHaveStyle({ animationName: "spin" });
  });

  test("holds still when the device asks for less motion", async () => {
    await commands.emulateReducedMotion("reduce");
    const screen = await renderIn("light", Spinner, {});
    await expect
      .element(screen.container.querySelector("svg"))
      .toHaveStyle({ animationName: "none" });
  });

  test("is drawn in the text colour around it", async () => {
    // Any colour the caller sets, not a role.
    const colour = "rgb(185, 28, 28)";
    const screen = await renderIn("light", Spinner, {
      style: `color: ${colour}`,
    });
    const circles = screen.container.querySelectorAll<SVGElement>("svg circle");
    expect(circles).toHaveLength(2);
    for (const circle of circles) {
      await expect.element(circle).toHaveStyle({ stroke: colour });
    }
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Spinner, {
      class: "ml-4",
      id: "loading",
    });
    const status = screen.getByRole("status");
    await expect.element(status).toHaveAttribute("id", "loading");
    await expect.element(status).toHaveStyle({ marginLeft: "16px" });
  });
});
