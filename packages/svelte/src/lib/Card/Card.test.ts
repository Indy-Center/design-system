import { describe, expect, test } from "vitest";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import Card from "./Card.svelte";

const body = text("Friday Night Ops");

describe("Card", () => {
  test("is a div around its content by default", async () => {
    const screen = await renderIn("light", Card, { children: body });
    const content = screen.getByText("Friday Night Ops");
    await expect.element(content).toBeInTheDocument();
    expect(content.element().parentElement!.tagName).toBe("DIV");
  });

  test.each(["article", "section", "li"] as const)(
    "renders as %s when asked",
    async (as) => {
      const screen = await renderIn("light", Card, { as, children: body });
      const card = screen
        .getByText("Friday Night Ops")
        .element().parentElement!;
      expect(card.tagName).toBe(as.toUpperCase());
    },
  );

  // Chosen in ticket 10: border only, `card` fill, `border` edge, no shadow.
  test.each(SCHEMES)(
    "is the card surface with a border and no shadow in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Card, { children: body });
      const card = screen
        .getByText("Friday Night Ops")
        .element().parentElement!;
      expect(getComputedStyle(card)).toMatchObject({
        backgroundColor: role("card", scheme),
        borderTopColor: role("border", scheme),
        borderTopStyle: "solid",
        borderTopWidth: "1px",
        borderTopLeftRadius: "8px",
        boxShadow: "none",
      });
    },
  );

  test("pads its content, unless flush", async () => {
    const padded = await renderIn("light", Card, { children: body });
    const card = padded.getByText("Friday Night Ops").element().parentElement!;
    expect(getComputedStyle(card).paddingTop).toBe("16px");

    const flush = await renderIn("light", Card, {
      flush: true,
      children: text("Controllers online"),
    });
    const flushCard = flush
      .getByText("Controllers online")
      .element().parentElement!;
    expect(getComputedStyle(flushCard)).toMatchObject({
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
    const card = screen.getByText("Friday Night Ops").element().parentElement!;
    expect(card.id).toBe("event");
    expect(getComputedStyle(card)).toMatchObject({
      marginTop: "24px",
      backgroundColor: role("card", "light"),
    });
  });
});
