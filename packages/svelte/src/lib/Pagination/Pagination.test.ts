import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Pagination from "./Pagination.svelte";

/** The visible page buttons' names, in order, with "…" for a gap. */
function shown(nav: HTMLElement): string[] {
  const items = [...nav.querySelectorAll("button, [data-gap]")];
  return items
    .filter((el) => el.checkVisibility())
    .map((el) =>
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
    await expect
      .element(screen.getByRole("navigation"))
      .not.toBeInTheDocument();
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

  test("moves to a page clicked, and by previous and next, telling the app", async () => {
    const pages: number[] = [];
    const screen = await renderIn("light", Pagination, {
      pageCount: 3,
      onchange: (page: number) => pages.push(page),
    });
    const current = () =>
      screen.container.querySelector("[aria-current='page']")!;
    await screen.getByRole("button", { name: "Page 3" }).click();
    expect(current().getAttribute("aria-label")).toBe("Page 3");
    await screen.getByRole("button", { name: "Previous page" }).click();
    expect(current().getAttribute("aria-label")).toBe("Page 2");
    await screen.getByRole("button", { name: "Next page" }).click();
    expect(current().getAttribute("aria-label")).toBe("Page 3");
    expect(pages).toEqual([3, 2, 3]);
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
      style: "width: 400px",
    });
    const nav = screen.getByRole("navigation").element() as HTMLElement;
    expect(shown(nav)).toEqual(["Previous page", ...pages, "Next page"]);
  });

  // Gaps only when needed: four pages fit a narrow card, seven a wide one.
  test.each([
    ["294px", 4],
    ["400px", 7],
  ] as const)("at %s shows all of %i pages", async (width, pageCount) => {
    const screen = await renderIn("light", Pagination, {
      pageCount,
      style: `width: ${width}`,
    });
    const nav = screen.getByRole("navigation").element() as HTMLElement;
    const pages = Array.from({ length: pageCount }, (_, i) => `Page ${i + 1}`);
    expect(shown(nav)).toEqual(["Previous page", ...pages, "Next page"]);
    expect(nav.getBoundingClientRect().height).toBe(44);
  });

  // In a card on a phone there is room for three pages, not five: the
  // pages beside the current one go.
  test.each([
    [1, ["Page 1", "…", "Page 20"]],
    [3, ["Page 1", "Page 2", "Page 3", "…", "Page 20"]],
    [4, ["Page 1", "…", "Page 4", "…", "Page 20"]],
    [10, ["Page 1", "…", "Page 10", "…", "Page 20"]],
    [20, ["Page 1", "…", "Page 20"]],
  ] as const)(
    "on page %i of 20 in a narrow card, shows %j",
    async (page, pages) => {
      const screen = await renderIn("light", Pagination, {
        pageCount: 20,
        page,
        style: "width: 294px",
      });
      const nav = screen.getByRole("navigation").element() as HTMLElement;
      expect(shown(nav)).toEqual(["Previous page", ...pages, "Next page"]);
    },
  );

  test("hides its gaps from screen readers", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 20 });
    const gap = screen.container.querySelector("[data-gap]")!;
    expect(gap.getAttribute("aria-hidden")).toBe("true");
  });

  // A gap of one page shows that page only while the row still fits.
  test("on page 3 of 5 in a narrow card, fills one gap, not both", async () => {
    const screen = await renderIn("light", Pagination, {
      pageCount: 5,
      page: 3,
      style: "width: 294px",
    });
    const nav = screen.getByRole("navigation").element() as HTMLElement;
    expect(shown(nav)).toEqual([
      "Previous page",
      "Page 1",
      "Page 2",
      "Page 3",
      "…",
      "Page 5",
      "Next page",
    ]);
  });

  // 400px: just wide enough to keep the neighbours (the wide row); below it
  // the narrow row shows, so its narrowest home, 294px (a card in the dark
  // header on a 390px phone), stands for a phone too. The pages are the
  // widest rows: the most buttons, or gaps of one page.
  test.each([
    ["400px", 60, 120],
    ["400px", 4, 20],
    ["400px", 4, 8],
    ["294px", 60, 120],
    ["294px", 4, 7],
    ["294px", 3, 5],
  ] as const)(
    "fits one row at %s on page %i of %i",
    async (width, page, pageCount) => {
      const screen = await renderIn("light", Pagination, {
        pageCount,
        page,
        style: `width: ${width}`,
      });
      // One row of 44px buttons, not wrapped onto a second.
      const nav = screen.getByRole("navigation").element();
      expect(nav.getBoundingClientRect().height).toBe(44);
    },
  );

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

  // The guide's `primary` under `primary-foreground` for the current page;
  // the others in `foreground-soft` with no fill (transparent). The fill
  // marks it, not the colour of its number.
  test("fills the current page", async () => {
    const screen = await renderIn("light", Pagination, {
      pageCount: 3,
      page: 2,
    });
    await expect
      .element(screen.getByRole("button", { name: "Page 2" }))
      .toHaveStyle({
        backgroundColor: role("primary", "light"),
        color: role("primary-foreground", "light"),
        fontWeight: "600",
      });
    await expect
      .element(screen.getByRole("button", { name: "Page 3" }))
      .toHaveStyle({
        backgroundColor: "rgba(0, 0, 0, 0)",
        color: role("foreground-soft", "light"),
      });
  });

  test("every button is at least 44px tall and wide", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 3 });
    for (const button of screen.getByRole("button").elements()) {
      const box = button.getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  // The guide's `ring` role.
  test("shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", Pagination, { pageCount: 3 });
    await userEvent.tab();
    await expect
      .element(screen.getByRole("button", { name: "Page 1" }))
      .toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", "light"),
      });
  });

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
