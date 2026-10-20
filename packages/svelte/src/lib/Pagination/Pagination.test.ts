import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Pagination from "./Pagination.svelte";

/** The page buttons' names, in order, with "…" for a gap. */
function shown(nav: HTMLElement): string[] {
  return [...nav.querySelectorAll("button, [data-gap]")].map((el) =>
    el.hasAttribute("data-gap")
      ? "…"
      : (el.getAttribute("aria-label") ?? el.textContent!.trim()),
  );
}

describe("Pagination", () => {
  test("is a navigation named Pagination, a button per page", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 3 });
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(shown(nav.element() as HTMLElement)).toEqual([
      "Previous page",
      "Page 1",
      "Page 2",
      "Page 3",
      "Next page",
    ]);
  });

  test("renders nothing when everything fits on one page", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 1 });
    expect(screen.container.querySelector("nav")).toBeNull();
  });

  test("marks the current page", async () => {
    const screen = await renderIn("light", Pagination, {
      pageCount: 3,
      page: 2,
    });
    await expect
      .element(screen.getByRole("button", { name: "Page 2" }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(screen.getByRole("button", { name: "Page 1" }))
      .not.toHaveAttribute("aria-current");
  });

  test("moves to a page clicked, and by previous and next", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 3 });
    const current = () =>
      screen.container.querySelector("[aria-current='page']")!;
    await screen.getByRole("button", { name: "Page 3" }).click();
    expect(current().getAttribute("aria-label")).toBe("Page 3");
    await screen.getByRole("button", { name: "Previous page" }).click();
    expect(current().getAttribute("aria-label")).toBe("Page 2");
    await screen.getByRole("button", { name: "Next page" }).click();
    expect(current().getAttribute("aria-label")).toBe("Page 3");
  });

  test("tells the app the page it moved to", async () => {
    const pages: number[] = [];
    const screen = await renderIn("light", Pagination, {
      pageCount: 3,
      onchange: (page: number) => pages.push(page),
    });
    await screen.getByRole("button", { name: "Page 3" }).click();
    await screen.getByRole("button", { name: "Previous page" }).click();
    expect(pages).toEqual([3, 2]);
  });

  test("disables previous on the first page and next on the last", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 2 });
    const previous = screen.getByRole("button", { name: "Previous page" });
    const next = screen.getByRole("button", { name: "Next page" });
    await expect.element(previous).toBeDisabled();
    await expect.element(next).toBeEnabled();
    await next.click();
    await expect.element(previous).toBeEnabled();
    await expect.element(next).toBeDisabled();
  });

  // So 44px buttons fit a phone: the first and last pages, the pages
  // beside the current one, and a gap for the rest. A gap of one page
  // shows that page instead.
  test.each([
    [1, ["Page 1", "Page 2", "…", "Page 20"]],
    [4, ["Page 1", "Page 2", "Page 3", "Page 4", "Page 5", "…", "Page 20"]],
    [10, ["Page 1", "…", "Page 9", "Page 10", "Page 11", "…", "Page 20"]],
    [20, ["Page 1", "…", "Page 19", "Page 20"]],
  ] as const)("on page %i of 20, shows %j", async (page, pages) => {
    const screen = await renderIn("light", Pagination, {
      pageCount: 20,
      page,
    });
    const nav = screen.getByRole("navigation").element() as HTMLElement;
    expect(shown(nav)).toEqual(["Previous page", ...pages, "Next page"]);
  });

  test("hides its gaps from screen readers", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 20 });
    const gap = screen.container.querySelector("[data-gap]")!;
    expect(gap.getAttribute("aria-hidden")).toBe("true");
  });

  test("fits a phone's width on any page", async () => {
    const screen = await renderIn("light", Pagination, {
      pageCount: 120,
      page: 60,
      // A 390px phone, less the 16px gutters.
      style: "width: 358px",
    });
    // One row of 44px buttons, not wrapped onto a second.
    const nav = screen.getByRole("navigation").element();
    expect(nav.getBoundingClientRect().height).toBe(44);
  });

  // A disabled button drops focus; a keyboard user would land on the page.
  test("keeps focus in the nav when next reaches the last page", async () => {
    const screen = await renderIn("light", Pagination, {
      pageCount: 2,
    });
    const next = screen.getByRole("button", { name: "Next page" });
    await next.click();
    await expect
      .element(screen.getByRole("button", { name: "Page 2" }))
      .toHaveFocus();
  });

  // The guide's `primary` (#0369A1) under `primary-foreground` (#FFFFFF)
  // for the current page, in both schemes; the others in `foreground-soft`
  // (#334155 light, #D1D5DB dark) with no fill. The fill marks it, not the
  // colour of its number.
  test.each([
    ["light", "rgb(51, 65, 85)"],
    ["dark", "rgb(209, 213, 219)"],
    ["dark-header", "rgb(209, 213, 219)"],
  ] as const)("fills the current page in %s", async (scheme, other) => {
    const screen = await renderIn(scheme, Pagination, {
      pageCount: 3,
      page: 2,
    });
    await expect
      .element(screen.getByRole("button", { name: "Page 2" }))
      .toHaveStyle({
        backgroundColor: "rgb(3, 105, 161)",
        color: "rgb(255, 255, 255)",
        fontWeight: "600",
      });
    await expect
      .element(screen.getByRole("button", { name: "Page 3" }))
      .toHaveStyle({ backgroundColor: "rgba(0, 0, 0, 0)", color: other });
  });

  test("every button is at least 44px tall and wide", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 3 });
    for (const button of screen.getByRole("button").elements()) {
      const box = button.getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Pagination, { pageCount: 3 });
      await userEvent.tab();
      await expect
        .element(screen.getByRole("button", { name: "Page 1" }))
        .toHaveStyle({ outlineStyle: "solid", outlineColor: colour });
    },
  );

  test("moves by keyboard: Tab to a page, Enter to go", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 3 });
    // Previous is disabled on page 1, so the first stop is page 1.
    await userEvent.tab();
    await expect
      .element(screen.getByRole("button", { name: "Page 1" }))
      .toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(screen.getByRole("button", { name: "Page 2" }))
      .toHaveAttribute("aria-current", "page");
  });
});
