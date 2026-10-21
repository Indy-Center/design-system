import { describe, expect, test } from "vitest";
import { onScreen, readOut } from "../../../test/readOut.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Steps, { type Step } from "./Steps.svelte";

const steps: Step[] = [
  { label: "Joined the waitlist", state: "done", date: "18 October 2026" },
  { label: "Training", state: "current", detail: "Teacher: Jo Bloggs" },
  { label: "Rating exam", state: "upcoming" },
];

describe("Steps", () => {
  test("is an ordered list of its steps, in order", async () => {
    const screen = await renderIn("light", Steps, { steps });
    const list = screen.getByRole("list");
    await expect.element(list).toBeVisible();
    expect(list.element().tagName).toBe("OL");
    const items = screen.getByRole("listitem").elements();
    expect(items.map((item) => item.textContent?.trim())).toEqual([
      expect.stringContaining("Joined the waitlist"),
      expect.stringContaining("Training"),
      expect.stringContaining("Rating exam"),
    ]);
  });

  test("marks the current step, and only it", async () => {
    const screen = await renderIn("light", Steps, { steps });
    const items = screen.getByRole("listitem").elements();
    expect(items.map((item) => item.getAttribute("aria-current"))).toEqual([
      null,
      "step",
      null,
    ]);
  });

  // Not every reader says aria-current on a list item, so the current step
  // is in words too, as a done step is; the eye has the icons.
  test("tells readers a step is done or current in words, off screen", async () => {
    const screen = await renderIn("light", Steps, { steps });
    const items = screen.getByRole("listitem").elements();
    expect(items.map(readOut)).toEqual([
      "Joined the waitlist (done) 18 October 2026",
      "Training (current step) Teacher: Jo Bloggs",
      "Rating exam",
    ]);
    expect(items.map(onScreen)).toEqual([
      "Joined the waitlist 18 October 2026",
      "Training Teacher: Jo Bloggs",
      "Rating exam",
    ]);
  });

  test("shows each state by its own icon, not colour alone", async () => {
    const screen = await renderIn("light", Steps, { steps });
    const icons = screen
      .getByRole("listitem")
      .elements()
      .map((item) => item.querySelector("svg"));
    for (const icon of icons) {
      expect(icon?.getAttribute("aria-hidden")).toBe("true");
    }
    const shapes = icons.map((icon) =>
      icon?.querySelector("path")?.getAttribute("d"),
    );
    expect(new Set(shapes).size).toBe(3);
  });

  // From the brand guide's Roles table: done is `success`, current `info`,
  // to come `muted-foreground`, as are details; done and current labels are
  // `foreground`; the line between steps is `border`.
  test("takes its colours from the roles", async () => {
    const muted = role("muted-foreground", "light");
    const label = role("foreground", "light");
    const screen = await renderIn("light", Steps, { steps });
    const icons = screen
      .getByRole("listitem")
      .elements()
      .map((item) => item.querySelector<SVGElement>("svg path")!);
    for (const [icon, fill] of [
      [icons[0], role("success", "light")],
      [icons[1], role("info", "light")],
      [icons[2], muted],
    ] as const) {
      await expect.element(icon).toHaveStyle({ fill });
    }
    await expect
      .element(screen.getByText(/^Joined the waitlist/))
      .toHaveStyle({ color: label });
    await expect
      .element(screen.getByText(/^Training/))
      .toHaveStyle({ color: label });
    await expect
      .element(screen.getByText("Rating exam"))
      .toHaveStyle({ color: muted });
    await expect
      .element(screen.getByText("Teacher: Jo Bloggs"))
      .toHaveStyle({ color: muted });
    const line = screen.container.querySelector<HTMLElement>(
      "li > span[aria-hidden]",
    );
    await expect
      .element(line)
      .toHaveStyle({ backgroundColor: role("border", "light") });
  });

  test("joins each step to the next with a line, not the last", async () => {
    const screen = await renderIn("light", Steps, { steps });
    const lines = screen
      .getByRole("listitem")
      .elements()
      .map((item) => item.querySelector(":scope > span[aria-hidden]"));
    expect(lines.map(Boolean)).toEqual([true, true, false]);
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Steps, {
      steps,
      class: "mt-4",
      "aria-label": "Your request",
    });
    const list = screen.getByRole("list", { name: "Your request" });
    await expect.element(list).toHaveStyle({ marginTop: "16px" });
  });

  // Training's timeline holds a missing date or detail as null.
  test("shows a step's detail and date, and takes null for missing ones", async () => {
    const screen = await renderIn("light", Steps, { steps });
    await expect.element(screen.getByText("Teacher: Jo Bloggs")).toBeVisible();
    await expect.element(screen.getByText("18 October 2026")).toBeVisible();

    const nulls = await renderIn("light", Steps, {
      steps: [
        { label: "Training", state: "current", detail: null, date: null },
      ],
    });
    expect(nulls.getByRole("listitem").element().textContent).toMatch(
      /^\s*Training\s*\(current step\)\s*$/,
    );
  });
});
