import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import Card from "./Card.svelte";

const body = text("Friday Night Ops");
const cardOf = (content: Element) => content.parentElement!;

describe("Card", () => {
  test.each([
    [undefined, "DIV"],
    ["article", "ARTICLE"],
    ["section", "SECTION"],
    ["li", "LI"],
  ] as const)("as %s, is a %s around its content", async (as, tag) => {
    const screen = await renderIn("light", Card, { as, children: body });
    const card = cardOf(screen.getByText("Friday Night Ops").element());
    expect(card.tagName).toBe(tag);
  });

  // Chosen in ticket 10: border only, `card` fill, `border` edge, no shadow.
  test("is the card surface with a border and no shadow", async () => {
    const screen = await renderIn("light", Card, { children: body });
    const card = cardOf(screen.getByText("Friday Night Ops").element());
    await expect.element(card).toHaveStyle({
      backgroundColor: role("card", "light"),
      borderTopColor: role("border", "light"),
      boxShadow: "none",
    });
  });

  test("pads its content, unless flush", async () => {
    const padded = await renderIn("light", Card, { children: body });
    const card = cardOf(padded.getByText("Friday Night Ops").element());
    await expect.element(card).toHaveStyle({ paddingTop: "16px" });

    const flush = await renderIn("light", Card, {
      flush: true,
      children: text("Controllers online"),
    });
    const flushCard = cardOf(flush.getByText("Controllers online").element());
    await expect.element(flushCard).toHaveStyle({
      paddingTop: "0px",
      // The corners still clip a list or table that runs to the edge.
      overflow: "hidden",
    });
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Card, {
      id: "event",
      class: "mt-6",
      children: body,
    });
    const card = cardOf(screen.getByText("Friday Night Ops").element());
    await expect.element(card).toHaveAttribute("id", "event");
    await expect.element(card).toHaveStyle({
      marginTop: "24px",
      backgroundColor: role("card", "light"),
    });
  });
});
