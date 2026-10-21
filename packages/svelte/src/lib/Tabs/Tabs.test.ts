import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Tabs from "./Tabs.svelte";

const props = () => ({
  label: "Admin",
  items: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/feedback", label: "Feedback" },
  ],
  current: "/admin/users",
});

describe("Tabs", () => {
  test("is a navigation landmark named by its label, holding a link per tab", async () => {
    const screen = await renderIn("light", Tabs, props());
    const nav = screen.getByRole("navigation", { name: "Admin" });
    await expect.element(nav).toBeInTheDocument();
    const links = nav.getByRole("link").elements();
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      "Overview",
      "Users",
      "Feedback",
    ]);
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "/admin",
      "/admin/users",
      "/admin/feedback",
    ]);
  });

  test("marks only the current tab as the current page", async () => {
    const screen = await renderIn("light", Tabs, props());
    await expect
      .element(screen.getByRole("link", { name: "Users" }))
      .toHaveAttribute("aria-current", "page");
    for (const name of ["Overview", "Feedback"]) {
      await expect
        .element(screen.getByRole("link", { name }))
        .not.toHaveAttribute("aria-current");
    }
  });

  test("marks no tab on a page outside the tabs", async () => {
    const screen = await renderIn("light", Tabs, {
      ...props(),
      current: "/admin/settings",
    });
    expect(screen.container.querySelector("[aria-current]")).toBeNull();
  });

  // Not by colour alone (WCAG 1.4.1): the current tab also has a bar under
  // it and bolder text. The bar is the guide's `link` role (#0369A1 light,
  // #38BDF8 dark); its text `foreground` (#0F172A light, #FFFFFF dark); the
  // others `muted-foreground` (#475569 light, #9CA3AF dark).
  test.each([
    ["light", "rgb(3, 105, 161)", "rgb(15, 23, 42)", "rgb(71, 85, 105)"],
    ["dark", "rgb(56, 189, 248)", "rgb(255, 255, 255)", "rgb(156, 163, 175)"],
    [
      "dark-header",
      "rgb(56, 189, 248)",
      "rgb(255, 255, 255)",
      "rgb(156, 163, 175)",
    ],
  ] as const)(
    "shows the current tab with a bar and bold text in %s",
    async (scheme, bar, current, other) => {
      const screen = await renderIn(scheme, Tabs, props());
      await expect
        .element(screen.getByRole("link", { name: "Users" }))
        .toHaveStyle({
          borderBottomStyle: "solid",
          borderBottomWidth: "2px",
          borderBottomColor: bar,
          color: current,
          fontWeight: "600",
        });
      await expect
        .element(screen.getByRole("link", { name: "Feedback" }))
        .toHaveStyle({
          borderBottomColor: "rgba(0, 0, 0, 0)",
          color: other,
          fontWeight: "400",
        });
    },
  );

  // A grid or flex item grows to its content; the tabs must scroll instead
  // of pushing the page wider than a phone.
  test("scrolls inside a narrow grid rather than widening it", async () => {
    const screen = await renderIn("light", Tabs, {
      label: "Admin",
      items: ["Overview", "Users", "Events", "Feedback", "Partners"].map(
        (label) => ({ href: `#${label}`, label }),
      ),
    });
    screen.container.style.cssText = "display: grid; width: 200px";
    const nav = screen.getByRole("navigation").element();
    expect(nav.getBoundingClientRect().width).toBeLessThanOrEqual(200);
    const list = nav.querySelector("ul")!;
    expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);
  });

  test("each tab is at least 44px tall and wide", async () => {
    const screen = await renderIn("light", Tabs, {
      label: "Course",
      items: [{ href: "/s1", label: "S1" }],
    });
    const box = screen
      .getByRole("link", { name: "S1" })
      .element()
      .getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  });

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Tabs, props());
      await userEvent.tab();
      const first = screen.getByRole("link", { name: "Overview" });
      await expect.element(first).toHaveFocus();
      await expect
        .element(first)
        .toHaveStyle({ outlineStyle: "solid", outlineColor: colour });
    },
  );

  test("adds a caller's class and attributes to the nav", async () => {
    const screen = await renderIn("light", Tabs, {
      ...props(),
      id: "admin-tabs",
      class: "mb-6",
    });
    const nav = screen.getByRole("navigation");
    await expect.element(nav).toHaveAttribute("id", "admin-tabs");
    await expect.element(nav).toHaveStyle({ marginBottom: "24px" });
  });
});
