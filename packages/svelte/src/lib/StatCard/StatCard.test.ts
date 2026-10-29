import { describe, expect, test } from "vitest";
import { expectReadable, translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { icon } from "../../../test/snippets.ts";
import StatCard from "./StatCard.svelte";

const users = {
  label: "Total users",
  value: 412,
  detail: "287 controllers",
};

/** The card around the list. */
const cardOf = (term: Element) => term.closest("dl")!.parentElement!;

describe("StatCard", () => {
  test("is a description list: the label the term, the number its value", async () => {
    const screen = await renderIn("light", StatCard, users);
    await expect
      .element(screen.getByRole("term"))
      .toHaveTextContent("Total users");
    const [number, detail] = screen.getByRole("definition").elements();
    expect(number.textContent!.trim()).toBe("412");
    expect(detail.textContent!.trim()).toBe("287 controllers");
  });

  test("leaves the sub-line out when it has none", async () => {
    const screen = await renderIn("light", StatCard, {
      label: "Events",
      value: "38",
    });
    expect(screen.getByRole("definition").elements()).toHaveLength(1);
  });

  test("writes a number with thousands separators", async () => {
    const screen = await renderIn("light", StatCard, {
      label: "Sessions this year",
      value: 12345,
    });
    await expect
      .element(screen.getByRole("definition"))
      .toHaveTextContent("12,345");
  });

  // Sizes chosen in ticket 10: label sm, number 2xl semibold in Source
  // Sans 3, sub-line sm (the community site's was xs).
  test("has the label and sub-line at sm and the number at 2xl", async () => {
    const screen = await renderIn("light", StatCard, users);
    const [number, detail] = screen.getByRole("definition").elements();
    await expect
      .element(screen.getByRole("term"))
      .toHaveStyle({ fontSize: "14px" });
    await expect
      .element(number)
      .toHaveStyle({ fontSize: "24px", fontWeight: "600" });
    expect(getComputedStyle(number).fontFamily).toMatch(/^"Source Sans 3"/);
    await expect.element(detail).toHaveStyle({ fontSize: "14px" });
  });

  // A Card (its looks are Card's); `foreground` for the number,
  // `muted-foreground` for the label and sub-line.
  test("takes the roles' colours, its sub-line readable", async () => {
    const screen = await renderIn("light", StatCard, users);
    const term = screen.getByRole("term");
    await expect
      .element(cardOf(term.element()))
      .toHaveStyle({ backgroundColor: role("card", "light") });
    const muted = role("muted-foreground", "light");
    await expect.element(term).toHaveStyle({ color: muted });
    const [number, detail] = screen.getByRole("definition").elements();
    await expect
      .element(number)
      .toHaveStyle({ color: role("foreground", "light") });
    await expect.element(detail).toHaveStyle({ color: muted });
    expectReadable(detail, "light");
  });

  // IconTile's primary square; its looks are tested in IconTile.
  test("puts the icon in a primary tile after the list, hidden from screen readers", async () => {
    const screen = await renderIn("light", StatCard, { ...users, icon });
    const svg = screen.getByTestId("icon").element();
    const tile = svg.parentElement!;
    await expect.element(tile).toHaveAttribute("aria-hidden", "true");
    await expect.element(tile).toHaveStyle({
      backgroundColor: translucent(role("primary", "light"), 15),
    });
    // The tile comes after the list, so it's read after the numbers.
    const term = screen.getByRole("term").element();
    expect(
      term.compareDocumentPosition(svg) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("has no tile without an icon", async () => {
    const screen = await renderIn("light", StatCard, users);
    const card = cardOf(screen.getByRole("term").element());
    expect(card.querySelector("[aria-hidden]")).toBeNull();
  });

  // The card wraps the list: `class` (layout) goes on the card, the rest
  // on the dl.
  test("puts a caller's class on the card and attributes on the list", async () => {
    const screen = await renderIn("light", StatCard, {
      ...users,
      id: "users",
      class: "mt-6",
    });
    const list = screen.getByRole("term").element().closest("dl")!;
    await expect.element(list).toHaveAttribute("id", "users");
    await expect.element(list.parentElement!).toHaveStyle({
      marginTop: "24px",
      paddingTop: "16px",
    });
  });
});
