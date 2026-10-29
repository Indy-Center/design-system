import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import MemberDetails from "./DescriptionList.test.svelte";

/** Where a term and its value sit, relative to each other. */
function layout(term: Element, value: Element) {
  const t = term.getBoundingClientRect();
  const v = value.getBoundingClientRect();
  return {
    stacked: v.top >= t.bottom,
    sideBySide: v.left >= t.right,
    leftAligned: v.left === t.left,
  };
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

  // Narrower than 24rem (a phone): the value goes under its term.
  test("stacks each term over its value when narrow", async () => {
    const screen = await renderIn("light", MemberDetails, {});
    screen.container.style.width = "360px";
    const term = screen.getByText("CID").element();
    const value = screen.getByText("1234567").element();
    expect(layout(term, value)).toEqual({
      stacked: true,
      sideBySide: false,
      leftAligned: true,
    });
  });

  // From 24rem wide (the list's own width), the value sits beside its term.
  test("puts each value beside its term when wide", async () => {
    const screen = await renderIn("light", MemberDetails, {});
    screen.container.style.width = "800px";
    const term = screen.getByText("CID").element();
    const value = screen.getByText("1234567").element();
    expect(layout(term, value)).toEqual({
      stacked: false,
      sideBySide: true,
      leftAligned: false,
    });
  });

  test("lines a row's second value up under its first when wide", async () => {
    const screen = await renderIn("light", MemberDetails, {});
    screen.container.style.width = "800px";
    const first = screen.getByText("IND Tier 1").element();
    const second = screen.getByText("SDF Tower").element();
    expect(layout(first, second)).toEqual({
      stacked: true,
      sideBySide: false,
      leftAligned: true,
    });
  });

  // The guide's roles: `muted-foreground` the terms, `foreground` the
  // values, `border` the lines between rows.
  test("takes the roles' colours", async () => {
    const screen = await renderIn("light", MemberDetails, {});
    await expect
      .element(screen.getByText("CID"))
      .toHaveStyle({ color: role("muted-foreground", "light") });
    await expect
      .element(screen.getByText("1234567"))
      .toHaveStyle({ color: role("foreground", "light") });
    // Tailwind's divide-y draws each row's line along its bottom.
    const first = screen.getByText("CID").element().parentElement!;
    await expect.element(first).toHaveStyle({
      borderBottomStyle: "solid",
      borderBottomColor: role("border", "light"),
    });
  });

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
