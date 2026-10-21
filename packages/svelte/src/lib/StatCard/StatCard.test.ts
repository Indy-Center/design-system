import { describe, expect, test } from "vitest";
import {
  SCHEMES,
  expectReadable,
  translucent,
} from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { icon } from "../../../test/snippets.ts";
import StatCard from "./StatCard.svelte";

const users = {
  label: "Total users",
  value: 412,
  detail: "287 controllers",
};

describe("StatCard", () => {
  test("is a description list: the label the term, the number its value", async () => {
    const screen = await renderIn("light", StatCard, users);
    const term = screen.getByRole("term");
    await expect.element(term).toHaveTextContent("Total users");
    expect(term.element().parentElement!.tagName).toBe("DL");
    const [number, detail] = screen.getByRole("definition").elements();
    expect(number.textContent!.trim()).toBe("412");
    expect(detail.textContent!.trim()).toBe("287 controllers");
    expect(number.previousElementSibling).toBe(term.element());
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
    expect(getComputedStyle(number)).toMatchObject({
      fontSize: "24px",
      fontWeight: "600",
    });
    expect(getComputedStyle(number).fontFamily).toMatch(/^"Source Sans 3"/);
    expect(getComputedStyle(detail).fontSize).toBe("14px");
  });

  // `card` with a `border` edge; `foreground` for the number;
  // `muted-foreground` for the label and sub-line.
  test.each(SCHEMES)(
    "takes the roles' colours in %s, its sub-line readable",
    async (scheme) => {
      const screen = await renderIn(scheme, StatCard, users);
      const term = screen.getByRole("term");
      const box = term.element().closest("dl")!.parentElement!;
      expect(getComputedStyle(box)).toMatchObject({
        backgroundColor: role("card", scheme),
        borderTopColor: role("border", scheme),
        borderTopStyle: "solid",
      });
      const muted = role("muted-foreground", scheme);
      await expect.element(term).toHaveStyle({ color: muted });
      const [number, detail] = screen.getByRole("definition").elements();
      expect(getComputedStyle(number).color).toBe(role("foreground", scheme));
      expect(getComputedStyle(detail).color).toBe(muted);
      expectReadable(detail, scheme);
    },
  );

  // The tile: `primary` at 15%, the icon in `link`.
  test.each(SCHEMES)(
    "puts the icon in a primary tile, hidden from screen readers, in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, StatCard, { ...users, icon });
      const svg = screen.getByTestId("icon").element();
      const tile = svg.parentElement!;
      expect(tile.getAttribute("aria-hidden")).toBe("true");
      expect(getComputedStyle(tile)).toMatchObject({
        backgroundColor: translucent(role("primary", scheme), 15),
        color: role("link", scheme),
      });
      // The tile comes after the list, so it's read after the numbers.
      expect(tile.previousElementSibling!.tagName).toBe("DL");
    },
  );

  test("has no tile without an icon", async () => {
    const screen = await renderIn("light", StatCard, users);
    const box = screen
      .getByRole("term")
      .element()
      .closest("dl")!.parentElement!;
    expect(box.children).toHaveLength(1);
  });

  // The card wraps the list: `class` (layout) goes on the card, the rest
  // on the dl.
  test("puts a caller's class on the card and attributes on the list", async () => {
    const screen = await renderIn("light", StatCard, {
      ...users,
      id: "users",
      class: "mt-6",
    });
    const list = screen.getByRole("term").element().parentElement!;
    expect(list.id).toBe("users");
    expect(getComputedStyle(list.parentElement!)).toMatchObject({
      marginTop: "24px",
      paddingTop: "16px",
    });
  });
});
