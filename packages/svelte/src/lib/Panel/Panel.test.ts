import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { expectLeadingHiddenIcon, icon, text } from "../../../test/snippets.ts";
import Panel from "./Panel.svelte";

const online = {
  title: "Controllers online",
  level: 2,
  children: text("IND_CTR"),
} as const;

describe("Panel", () => {
  // Named by its heading, so it's a region a reader can jump to.
  test.each([2, 6] as const)(
    "is a section named by an h%i title",
    async (level) => {
      const screen = await renderIn("light", Panel, { ...online, level });
      await expect
        .element(
          screen.getByRole("heading", { name: "Controllers online", level }),
        )
        .toBeInTheDocument();
      const region = screen.getByRole("region", { name: "Controllers online" });
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

  // Chosen in ticket 10: Heading's h4 look at any level, in sentence case.
  test("has its title in the h4 look, not capitals", async () => {
    const screen = await renderIn("light", Panel, online);
    await expect.element(screen.getByRole("heading")).toHaveStyle({
      fontSize: "16px",
      textTransform: "none",
    });
  });

  // A Card, with a rule under the title.
  test("is a card with a rule under its title", async () => {
    const screen = await renderIn("light", Panel, online);
    await expect.element(screen.getByRole("region")).toHaveStyle({
      backgroundColor: role("card", "light"),
      borderTopColor: role("border", "light"),
    });
    const heading = screen.getByRole("heading");
    await expect.element(heading.element().parentElement!).toHaveStyle({
      borderBottomColor: role("border", "light"),
      borderBottomStyle: "solid",
      borderBottomWidth: "1px",
    });
    await expect
      .element(heading)
      .toHaveStyle({ color: role("foreground", "light") });
  });

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

  test("puts an icon before the title, hidden and muted", async () => {
    const screen = await renderIn("light", Panel, { ...online, icon });
    const svg = screen.getByTestId("icon").element();
    const bar = screen.getByRole("heading").element().parentElement!;
    expectLeadingHiddenIcon(bar, svg);
    await expect
      .element(svg.parentElement!)
      .toHaveStyle({ color: role("muted-foreground", "light") });
    // The icon stays out of the region's name.
    await expect
      .element(screen.getByRole("region", { name: "Controllers online" }))
      .toBeInTheDocument();
  });

  test("adds a caller's class and attributes to the section", async () => {
    const screen = await renderIn("light", Panel, {
      ...online,
      id: "online",
      class: "mt-6",
    });
    const region = screen.getByRole("region");
    await expect.element(region).toHaveAttribute("id", "online");
    await expect.element(region).toHaveStyle({ marginTop: "24px" });
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
