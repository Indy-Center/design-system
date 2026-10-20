import { describe, expect, test } from "vitest";
import MemberDetails from "../../../test/fixtures/MemberDetails.svelte";
import { renderIn } from "../../../test/schemes.ts";

/** Where `name`'s term and its value sit, relative to each other. */
function layout(term: Element, value: Element) {
  const t = term.getBoundingClientRect();
  const v = value.getBoundingClientRect();
  return { stacked: v.top >= t.bottom, sideBySide: v.left >= t.right };
}

describe("DescriptionList", () => {
  test("is a list of terms, each with its value", async () => {
    const screen = await renderIn("light", MemberDetails, {});
    await expect
      .element(screen.getByRole("term").filter({ hasText: "CID" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("definition").filter({ hasText: "1234567" }))
      .toBeInTheDocument();
  });

  // A phone's width: the value goes under its term.
  test("stacks each term over its value when narrow", async () => {
    const screen = await renderIn("light", MemberDetails, {});
    screen.container.style.width = "360px";
    const term = screen.getByText("CID").element();
    const value = screen.getByText("1234567").element();
    expect(layout(term, value)).toEqual({ stacked: true, sideBySide: false });
  });

  // From `sm` (640px) the value sits beside its term.
  test("puts each value beside its term when wide", async () => {
    const screen = await renderIn("light", MemberDetails, {});
    screen.container.style.width = "800px";
    const term = screen.getByText("CID").element();
    const value = screen.getByText("1234567").element();
    expect(layout(term, value)).toEqual({ stacked: false, sideBySide: true });
  });

  test("lines a row's second value up under its first when wide", async () => {
    const screen = await renderIn("light", MemberDetails, {});
    screen.container.style.width = "800px";
    const first = screen.getByText("IND Tier 1").element();
    const second = screen.getByText("SDF Tower").element();
    const a = first.getBoundingClientRect();
    const b = second.getBoundingClientRect();
    expect(b.left).toBe(a.left);
    expect(b.top).toBeGreaterThanOrEqual(a.bottom);
  });

  // The guide's roles: `muted-foreground` the terms, `foreground` the
  // values, `border` the lines between rows.
  test.each([
    {
      scheme: "light",
      term: "rgb(71, 85, 105)",
      value: "rgb(15, 23, 42)",
      line: "rgb(226, 232, 240)",
    },
    {
      scheme: "dark",
      term: "rgb(156, 163, 175)",
      value: "rgb(255, 255, 255)",
      line: "rgb(51, 65, 85)",
    },
    {
      scheme: "dark-header",
      term: "rgb(156, 163, 175)",
      value: "rgb(255, 255, 255)",
      line: "rgb(51, 65, 85)",
    },
  ] as const)(
    "takes the roles' colours in $scheme",
    async ({ scheme, term, value, line }) => {
      const screen = await renderIn(scheme, MemberDetails, {});
      await expect
        .element(screen.getByText("CID"))
        .toHaveStyle({ color: term });
      await expect
        .element(screen.getByText("1234567"))
        .toHaveStyle({ color: value });
      const first = screen.getByText("CID").element().parentElement!;
      await expect.element(first).toHaveStyle({
        borderBottomStyle: "solid",
        borderBottomColor: line,
      });
    },
  );

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", MemberDetails, {
      class: "mt-6",
      "aria-label": "Member details",
    });
    const list = screen.container.querySelector("dl")!;
    expect(list.getAttribute("aria-label")).toBe("Member details");
    await expect.element(list).toHaveStyle({ marginTop: "24px" });
  });
});
