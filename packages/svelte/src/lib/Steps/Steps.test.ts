import { describe, expect, test } from "vitest";
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

  test("tells readers a step is done in words", async () => {
    const screen = await renderIn("light", Steps, { steps });
    const done = screen.getByText("(done)");
    await expect.element(done).toHaveStyle({ position: "absolute" });
    expect(done.elements()).toHaveLength(1);
    expect(screen.getByRole("listitem").first().element().textContent).toMatch(
      /Joined the waitlist\s*\(done\)/,
    );
  });

  // Not every reader says aria-current on a list item.
  test("tells readers the current step in words too", async () => {
    const screen = await renderIn("light", Steps, { steps });
    const current = screen.getByText("(current step)");
    await expect.element(current).toHaveStyle({ position: "absolute" });
    expect(current.elements()).toHaveLength(1);
    expect(screen.getByRole("listitem").nth(1).element().textContent).toMatch(
      /Training\s*\(current step\)/,
    );
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
  // `foreground`.
  const light = {
    done: "rgb(21, 128, 61)",
    current: "rgb(3, 105, 161)",
    muted: "rgb(71, 85, 105)",
    label: "rgb(15, 23, 42)",
    line: "rgb(226, 232, 240)",
  };
  const dark = {
    done: "rgb(74, 222, 128)",
    current: "rgb(56, 189, 248)",
    muted: "rgb(156, 163, 175)",
    label: "rgb(255, 255, 255)",
    line: "rgb(51, 65, 85)",
  };
  test.each([
    ["light", light],
    ["dark", dark],
    ["dark-header", dark],
  ] as const)(
    "takes its colours from the roles in %s",
    async (scheme, expected) => {
      const screen = await renderIn(scheme, Steps, { steps });
      const icons = screen
        .getByRole("listitem")
        .elements()
        .map((item) => item.querySelector("svg path")!);
      expect(icons.map((icon) => getComputedStyle(icon).fill)).toEqual([
        expected.done,
        expected.current,
        expected.muted,
      ]);
      await expect
        .element(screen.getByText(/^Joined the waitlist/))
        .toHaveStyle({ color: expected.label });
      await expect
        .element(screen.getByText(/^Training/))
        .toHaveStyle({ color: expected.label });
      await expect
        .element(screen.getByText("Rating exam"))
        .toHaveStyle({ color: expected.muted });
      await expect
        .element(screen.getByText("Teacher: Jo Bloggs"))
        .toHaveStyle({ color: expected.muted });
      const line = screen.container.querySelector<HTMLElement>(
        "li > span[aria-hidden]",
      );
      await expect
        .element(line)
        .toHaveStyle({ backgroundColor: expected.line });
    },
  );

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

  test("shows a step's detail and date", async () => {
    const screen = await renderIn("light", Steps, { steps });
    await expect.element(screen.getByText("Teacher: Jo Bloggs")).toBeVisible();
    await expect.element(screen.getByText("18 October 2026")).toBeVisible();
  });

  // Training's timeline holds a missing date or detail as null.
  test("takes null for a missing detail or date", async () => {
    const screen = await renderIn("light", Steps, {
      steps: [
        { label: "Training", state: "current", detail: null, date: null },
      ],
    });
    expect(screen.getByRole("listitem").element().textContent).toMatch(
      /^\s*Training\s*\(current step\)\s*$/,
    );
  });
});
