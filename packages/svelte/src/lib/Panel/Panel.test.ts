import { describe, expect, test } from "vitest";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { icon, text } from "../../../test/snippets.ts";
import Panel from "./Panel.svelte";

const online = {
  title: "Controllers online",
  level: 2,
  children: text("IND_CTR"),
} as const;

describe("Panel", () => {
  test.each([2, 3, 4, 5, 6] as const)(
    "is a section named by an h%i title",
    async (level) => {
      const screen = await renderIn("light", Panel, { ...online, level });
      const heading = screen.getByRole("heading", {
        name: "Controllers online",
        level,
      });
      await expect.element(heading).toBeInTheDocument();
      // Named by its heading, so it's a region a reader can jump to.
      const region = screen.getByRole("region", { name: "Controllers online" });
      expect(region.element().tagName).toBe("SECTION");
      await expect.element(region.getByText("IND_CTR")).toBeInTheDocument();
    },
  );

  // The community site's Panel read its props once; this one follows them.
  test("follows a change of title and level", async () => {
    const screen = await renderIn("light", Panel, online);
    await screen.rerender({ title: "Who's on", level: 3 });
    await expect
      .element(screen.getByRole("heading", { name: "Who's on", level: 3 }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("region", { name: "Who's on" }))
      .toBeInTheDocument();
  });

  // Chosen in ticket 10: the h4 look (base semibold, heading font) at any
  // level, in sentence case; a rule under the title.
  test.each([2, 5] as const)(
    "has its h%i title in the h4 look, not capitals",
    async (level) => {
      const screen = await renderIn("light", Panel, { ...online, level });
      const heading = screen.getByRole("heading");
      await expect.element(heading).toHaveStyle({
        fontSize: "16px",
        fontWeight: "600",
        textTransform: "none",
      });
      expect(getComputedStyle(heading.element()).fontFamily).toMatch(
        /^"Source Sans 3"/,
      );
    },
  );

  test.each(SCHEMES)(
    "is a card with a rule under its title in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Panel, online);
      const region = screen.getByRole("region").element();
      expect(getComputedStyle(region)).toMatchObject({
        backgroundColor: role("card", scheme),
        borderTopColor: role("border", scheme),
        borderTopStyle: "solid",
        boxShadow: "none",
      });
      const bar = screen.getByRole("heading").element().parentElement!;
      expect(getComputedStyle(bar)).toMatchObject({
        borderBottomColor: role("border", scheme),
        borderBottomStyle: "solid",
        borderBottomWidth: "1px",
      });
      await expect
        .element(screen.getByRole("heading"))
        .toHaveStyle({ color: role("foreground", scheme) });
    },
  );

  test("pads its body, unless flush", async () => {
    const padded = await renderIn("light", Panel, online);
    const body = padded.getByText("IND_CTR").element().parentElement!;
    expect(getComputedStyle(body).paddingTop).toBe("16px");

    const flush = await renderIn("light", Panel, {
      ...online,
      flush: true,
      children: text("IND_APP"),
    });
    const flushBody = flush.getByText("IND_APP").element().parentElement!;
    expect(getComputedStyle(flushBody).paddingTop).toBe("0px");
  });

  test.each(SCHEMES)(
    "puts an icon before the title, hidden and muted, in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Panel, { ...online, icon });
      const svg = screen.getByTestId("icon").element();
      const box = svg.parentElement!;
      expect(box.getAttribute("aria-hidden")).toBe("true");
      expect(box.nextElementSibling!.tagName).toBe("H2");
      expect(getComputedStyle(box).color).toBe(
        role("muted-foreground", scheme),
      );
      // The icon stays out of the region's name.
      await expect
        .element(screen.getByRole("region", { name: "Controllers online" }))
        .toBeInTheDocument();
    },
  );

  test("adds a caller's class and attributes to the section", async () => {
    const screen = await renderIn("light", Panel, {
      ...online,
      id: "online",
      class: "mt-6",
    });
    const region = screen.getByRole("region").element();
    expect(region.id).toBe("online");
    expect(getComputedStyle(region).marginTop).toBe("24px");
  });

  test("keeps its heading as its name over a caller's aria-labelledby", async () => {
    const screen = await renderIn("light", Panel, {
      ...online,
      "aria-labelledby": "elsewhere",
    });
    await expect
      .element(screen.getByRole("region", { name: "Controllers online" }))
      .toBeInTheDocument();
  });
});
