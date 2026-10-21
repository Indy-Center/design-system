import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import ControllerTable from "../../../test/fixtures/ControllerTable.svelte";
import { renderIn } from "../../../test/schemes.ts";

describe("Table", () => {
  test("is a table named by its caption", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    await expect
      .element(screen.getByRole("table", { name: "Online controllers" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("cell", { name: "128.225" }))
      .toBeInTheDocument();
  });

  // A keyboard can only scroll a region it can focus (WCAG 2.1.1), and a
  // screen reader names that stop by the caption.
  test("sits in a scroll region named by its caption, focusable when it scrolls", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    screen.container.style.width = "200px";
    const region = screen.getByRole("region", { name: "Online controllers" });
    await expect.element(region).toHaveStyle({ overflowX: "auto" });
    await expect.element(region).toHaveAttribute("tabindex", "0");
    await userEvent.tab();
    await expect.element(region).toHaveFocus();
  });

  // Nothing to scroll, so no extra stop: Tab goes straight to the link.
  test("isn't a Tab stop when the table fits", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    screen.container.style.width = "800px";
    await expect
      .element(screen.getByRole("region"))
      .not.toHaveAttribute("tabindex");
    await userEvent.tab();
    await expect.element(screen.getByRole("link")).toHaveFocus();
  });

  test("gives each header cell its scope", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    await expect
      .element(screen.getByRole("columnheader", { name: "Callsign" }))
      .toHaveAttribute("scope", "col");
    await expect
      .element(screen.getByRole("rowheader", { name: "IND_83_CTR" }))
      .toHaveAttribute("scope", "row");
  });

  test("can hide its caption from sight but not from screen readers", async () => {
    const screen = await renderIn("light", ControllerTable, {
      hideCaption: true,
    });
    await expect
      .element(screen.getByRole("region", { name: "Online controllers" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Online controllers"))
      .toHaveStyle({ position: "absolute", width: "1px" });
  });

  // A row that goes somewhere has a real link in a cell.
  test("keeps a link in a cell", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    await expect
      .element(screen.getByRole("link", { name: "Jane Doe" }))
      .toHaveAttribute("href", "/roster/1234567");
  });

  // The guide's roles: `card` the body, `muted` the head, `foreground` the
  // headers, `foreground-soft` the cells, `border` the lines.
  test.each([
    {
      scheme: "light",
      card: "rgb(255, 255, 255)",
      muted: "rgb(226, 232, 240)",
      foreground: "rgb(15, 23, 42)",
      soft: "rgb(51, 65, 85)",
      border: "rgb(226, 232, 240)",
    },
    {
      scheme: "dark",
      card: "rgb(30, 41, 59)",
      muted: "rgb(51, 65, 85)",
      foreground: "rgb(255, 255, 255)",
      soft: "rgb(209, 213, 219)",
      border: "rgb(51, 65, 85)",
    },
    {
      scheme: "dark-header",
      card: "rgb(30, 41, 59)",
      muted: "rgb(51, 65, 85)",
      foreground: "rgb(255, 255, 255)",
      soft: "rgb(209, 213, 219)",
      border: "rgb(51, 65, 85)",
    },
  ] as const)(
    "takes the roles' colours in $scheme",
    async ({ scheme, card, muted, foreground, soft, border }) => {
      const screen = await renderIn(scheme, ControllerTable, {});
      await expect
        .element(screen.getByRole("table"))
        .toHaveStyle({ backgroundColor: card });
      await expect
        .element(screen.getByRole("region"))
        .toHaveStyle({ borderTopColor: border });
      const header = screen.getByRole("columnheader", { name: "Callsign" });
      await expect.element(header).toHaveStyle({ color: foreground });
      const head = header.element().closest("thead")!;
      await expect.element(head).toHaveStyle({ backgroundColor: muted });
      await expect
        .element(screen.getByRole("rowheader"))
        .toHaveStyle({ color: foreground });
      const cell = screen.getByRole("cell", { name: "128.225" });
      await expect.element(cell).toHaveStyle({ color: soft });
      await expect
        .element(cell.element().closest("tr")!)
        .toHaveStyle({ borderTopColor: border });
    },
  );

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline on its region when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, ControllerTable, {});
      screen.container.style.width = "200px";
      const region = screen.getByRole("region");
      await expect.element(region).toHaveAttribute("tabindex", "0");
      await userEvent.tab();
      await expect.element(region).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );

  // On a phone the table scrolls inside its region; the page doesn't.
  test("scrolls sideways inside its region when narrower than the table", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    screen.container.style.width = "200px";
    const region = screen.getByRole("region").element();
    expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    expect(screen.container.scrollWidth).toBeLessThanOrEqual(200);
  });

  // A grid or flex column grows to fit its content's narrowest width; the
  // table mustn't widen a page's column on a phone.
  test("doesn't widen a grid column it sits in", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    // The page's column (the render target) is a grid item, the table in it.
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.width = "200px";
    screen.container.before(grid);
    grid.append(screen.container);
    const region = screen.getByRole("region").element();
    expect(screen.container.clientWidth).toBeLessThanOrEqual(200);
    expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
    grid.remove();
  });
});
