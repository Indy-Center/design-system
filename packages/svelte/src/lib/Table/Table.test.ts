import { describe, expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import ControllerTable from "./Table.test.svelte";

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
  // screen reader names that stop by the caption. On a phone the table
  // scrolls inside its region; the page doesn't.
  test("sits in a scroll region named by its caption, focusable when it scrolls", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    screen.container.style.width = "200px";
    const region = screen.getByRole("region", { name: "Online controllers" });
    await expect.element(region).toHaveStyle({ overflowX: "auto" });
    expect(region.element().scrollWidth).toBeGreaterThan(
      region.element().clientWidth,
    );
    expect(screen.container.scrollWidth).toBeLessThanOrEqual(200);
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

  // The guide's roles: `card` the body, `muted` the head, `foreground` the
  // headers, `foreground-soft` the cells, `border` the lines.
  test("takes the roles' colours", async () => {
    const card = role("card", "light");
    const muted = role("muted", "light");
    const foreground = role("foreground", "light");
    const soft = role("foreground-soft", "light");
    const border = role("border", "light");
    const screen = await renderIn("light", ControllerTable, {});
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
  });

  // The `ring` role.
  test("shows a ring outline on its region when tabbed to", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    screen.container.style.width = "200px";
    const region = screen.getByRole("region");
    await expect.element(region).toHaveAttribute("tabindex", "0");
    await userEvent.tab();
    await expect.element(region).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  // `class` is for layout, so it goes on the region, the outer box; the
  // rest describe the table, so they go on the <table>.
  test("adds a caller's class to its region and attributes to its table", async () => {
    const screen = await renderIn("light", ControllerTable, {
      class: "mt-6",
      "aria-describedby": "note",
    });
    await expect
      .element(screen.getByRole("region"))
      .toHaveStyle({ marginTop: "24px" });
    await expect
      .element(screen.getByRole("table"))
      .toHaveAttribute("aria-describedby", "note");
  });

  // A grid or flex column grows to fit its content's narrowest width; the
  // table mustn't widen a page's column on a phone.
  test("doesn't widen a grid column it sits in", async () => {
    const screen = await renderIn("light", ControllerTable, {});
    // The page's column (the render target) is a grid item, the table in it.
    const grid = document.createElement("div");
    grid.style.display = "grid";
    grid.style.width = "200px";
    onTestFinished(() => grid.remove());
    screen.container.before(grid);
    grid.append(screen.container);
    const region = screen.getByRole("region").element();
    expect(screen.container.clientWidth).toBeLessThanOrEqual(200);
    expect(region.scrollWidth).toBeGreaterThan(region.clientWidth);
  });
});
