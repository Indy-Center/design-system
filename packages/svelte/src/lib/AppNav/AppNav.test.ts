// Which link is current is nav.ts's, tested in nav.node.test.ts. How a bar
// group opens and closes, the 44px targets and the ring are HeaderMenu's,
// tested in headerMenu/HeaderMenu.test.ts.
import { mdiAirplane, mdiCalendar, mdiChevronDown } from "@mdi/js";
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { expectReadable, translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { hubNav } from "../../playground/chrome.ts";
import AppNav from "./AppNav.svelte";
import AppNavMenu from "./AppNavMenu.svelte";

type Screen = Awaited<ReturnType<typeof renderIn>>;

const group = (screen: Screen, name: string) =>
  screen.getByRole("button", { name });

const SOFT_FILL = () => translucent(role("foreground", "dark"), 10);

describe("AppNav and AppNavMenu", () => {
  describe.each([
    { name: "AppNav", Nav: AppNav, iconSize: "16" },
    { name: "AppNavMenu", Nav: AppNavMenu, iconSize: "20" },
  ])("$name", ({ Nav, iconSize }) => {
    test("draws a link's and a group's icon before its label, hidden from screen readers", async () => {
      const screen = await renderIn("light", Nav, {
        items: [
          { href: "/events", label: "Events", icon: mdiCalendar },
          { label: "Flying", icon: mdiAirplane, children: [] },
          { href: "/roster", label: "Roster" },
        ],
      });
      const icons = (el: Element) =>
        [...el.querySelectorAll("svg")].map((svg) => ({
          d: svg.querySelector("path")!.getAttribute("d"),
          width: svg.getAttribute("width"),
          hidden: svg.getAttribute("aria-hidden"),
        }));
      const events = screen.getByRole("link", { name: "Events" }).element();
      expect(icons(events)).toEqual([
        { d: mdiCalendar, width: iconSize, hidden: "true" },
      ]);
      expect(events.firstElementChild?.tagName).toBe("svg");
      // The group's icon, then its chevron.
      expect(icons(group(screen, "Flying").element())).toEqual([
        { d: mdiAirplane, width: iconSize, hidden: "true" },
        { d: mdiChevronDown, width: "16", hidden: "true" },
      ]);
      expect(
        icons(screen.getByRole("link", { name: "Roster" }).element()),
      ).toEqual([]);
    });

    test("is a navigation named Main, its top-level links and groups in order", async () => {
      const screen = await renderIn("light", Nav, {
        items: hubNav,
      });
      const nav = screen.getByRole("navigation", { name: "Main" });
      await expect
        .element(nav.getByRole("link", { name: "Events" }))
        .toHaveAttribute("href", "/events");
      expect(
        nav
          .getByRole("button")
          .elements()
          .map((b) => b.textContent?.trim()),
      ).toEqual(["Controlling", "Flying", "About"]);
    });

    test("opens and closes a group from its button", async () => {
      const screen = await renderIn("light", Nav, {
        items: hubNav,
      });
      const about = group(screen, "About");
      await expect.element(about).toHaveAttribute("aria-expanded", "false");
      await expect
        .element(screen.getByRole("link", { name: "Staff" }))
        .not.toBeInTheDocument();

      await about.click();
      await expect.element(about).toHaveAttribute("aria-expanded", "true");
      await expect
        .element(screen.getByRole("link", { name: "Staff" }))
        .toHaveAttribute("href", "/staff");

      await about.click();
      await expect.element(about).toHaveAttribute("aria-expanded", "false");
    });

    test("marks the current page, and only it, on a page under it", async () => {
      const screen = await renderIn("light", Nav, {
        items: hubNav,
        current: "/events/42",
      });
      await expect
        .element(screen.getByRole("link", { name: "Events" }))
        .toHaveAttribute("aria-current", "page");
      expect(screen.container.querySelectorAll("[aria-current]")).toHaveLength(
        1,
      );
    });

    // label is the nav's one name: an aria-label can't override it.
    test("names its navigation by label alone, not a passed aria-label", async () => {
      const screen = await renderIn("light", Nav, {
        items: hubNav,
        label: "Training",
        // @ts-expect-error: aria-label isn't one of its props.
        "aria-label": "Other",
      });
      await expect
        .element(screen.getByRole("navigation", { name: "Training" }))
        .toBeInTheDocument();
    });

    test("puts a caller's class and attributes on the <nav>, and stays dark", async () => {
      const screen = await renderIn("light", Nav, {
        items: hubNav,
        class: "ml-4",
        id: "main-nav",
        "data-theme": "light",
      });
      const nav = screen.getByRole("navigation", { name: "Main" });
      await expect.element(nav).toHaveAttribute("id", "main-nav");
      await expect.element(nav).toHaveAttribute("data-theme", "dark");
      expect(nav.element().classList).toContain("ml-4");
    });
  });

  describe("AppNav, the bar", () => {
    test("opening one group closes another", async () => {
      const screen = await renderIn("light", AppNav, { items: hubNav });
      await group(screen, "About").click();
      await group(screen, "Flying").click();
      await expect
        .element(group(screen, "About"))
        .toHaveAttribute("aria-expanded", "false");
      await expect
        .element(group(screen, "Flying"))
        .toHaveAttribute("aria-expanded", "true");
    });

    // Dark in both schemes: once, on a light page, in the dark roles.
    test("draws in the dark roles: links in soft text, the current page and its group in full text on the soft fill", async () => {
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        current: "/staff",
      });
      const home = screen.getByRole("link", { name: "Home" });
      await expect.element(home).toHaveStyle({
        color: role("foreground-soft", "dark"),
        backgroundColor: "rgba(0, 0, 0, 0)", // no fill
        textDecorationLine: "none",
      });
      expectReadable(home.element(), "dark");
      const about = group(screen, "About");
      await expect.element(about).toHaveStyle({
        color: role("foreground", "dark"),
        backgroundColor: SOFT_FILL(),
        textDecorationLine: "none",
      });
      await about.click();
      const panel = document.getElementById(
        about.element().getAttribute("aria-controls")!,
      )!;
      await expect.element(panel).toHaveStyle({
        backgroundColor: role("card", "dark"),
        borderTopColor: role("border", "dark"),
      });
      const staff = screen.getByRole("link", { name: "Staff" });
      await expect.element(staff).toHaveStyle({
        color: role("foreground", "dark"),
        backgroundColor: SOFT_FILL(),
      });
      // On the panel's card.
      expectReadable(staff.element(), "dark");
      expectReadable(
        screen.getByRole("link", { name: "Partners" }).element(),
        "dark",
      );
    });
  });

  describe("AppNavMenu, the phone menu", () => {
    test("opens the group holding the current page from the start", async () => {
      const screen = await renderIn("light", AppNavMenu, {
        items: hubNav,
        current: "/staff",
      });
      await expect
        .element(group(screen, "About"))
        .toHaveAttribute("aria-expanded", "true");
      await expect
        .element(screen.getByRole("link", { name: "Staff" }))
        .toHaveAttribute("aria-current", "page");
      await expect
        .element(group(screen, "Flying"))
        .toHaveAttribute("aria-expanded", "false");
    });

    test("opens one of two groups that share a label by itself", async () => {
      const screen = await renderIn("light", AppNavMenu, {
        items: [
          { label: "More", children: [{ label: "A", href: "/a" }] },
          { label: "More", children: [{ label: "B", href: "/b" }] },
        ],
      });
      const [first, second] = screen.getByRole("button").all();
      await first.click();
      await expect.element(first).toHaveAttribute("aria-expanded", "true");
      await expect.element(second).toHaveAttribute("aria-expanded", "false");
    });

    // A phone menu lists the groups one under another: opening one leaves
    // the others as they are, and Escape is the phone menu's to handle.
    test("keeps groups open on another group, a click outside and Escape", async () => {
      const screen = await renderIn("light", AppNavMenu, { items: hubNav });
      await group(screen, "About").click();
      await group(screen, "Flying").click();
      await userEvent.click(document.body, { position: { x: 1, y: 1 } });
      await userEvent.keyboard("{Escape}");
      for (const name of ["About", "Flying"]) {
        await expect
          .element(group(screen, name))
          .toHaveAttribute("aria-expanded", "true");
      }
    });

    // Dark in both schemes: once, on a light page, in the dark roles.
    test("draws in the dark roles: rows in soft text, the current page and its group in full text on the soft fill", async () => {
      const screen = await renderIn("light", AppNavMenu, {
        items: hubNav,
        current: "/staff",
      });
      const home = screen.getByRole("link", { name: "Home" });
      await expect.element(home).toHaveStyle({
        color: role("foreground-soft", "dark"),
        backgroundColor: "rgba(0, 0, 0, 0)", // no fill
        textDecorationLine: "none",
      });
      expectReadable(home.element(), "dark");
      await expect.element(group(screen, "About")).toHaveStyle({
        color: role("foreground", "dark"),
        backgroundColor: SOFT_FILL(),
        textDecorationLine: "none",
      });
      await expect
        .element(screen.getByRole("link", { name: "Staff" }))
        .toHaveStyle({
          color: role("foreground", "dark"),
          backgroundColor: SOFT_FILL(),
          textDecorationLine: "none",
        });
    });
  });
});
