import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
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
  // it and bolder text. The bar is the `link` role, its text `foreground`;
  // the others `muted-foreground`, with a transparent bar.
  test.each(SCHEMES)(
    "shows the current tab with a bar and bold text in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Tabs, props());
      await expect
        .element(screen.getByRole("link", { name: "Users" }))
        .toHaveStyle({
          borderBottomStyle: "solid",
          borderBottomWidth: "2px",
          borderBottomColor: role("link", scheme),
          color: role("foreground", scheme),
          fontWeight: "600",
        });
      await expect
        .element(screen.getByRole("link", { name: "Feedback" }))
        .toHaveStyle({
          borderBottomColor: "rgba(0, 0, 0, 0)",
          color: role("muted-foreground", scheme),
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

  // The `ring` role.
  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Tabs, props());
      await userEvent.tab();
      const first = screen.getByRole("link", { name: "Overview" });
      await expect.element(first).toHaveFocus();
      await expect.element(first).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
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
