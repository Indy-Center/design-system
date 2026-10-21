import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  SCHEMES,
  expectReadable,
  translucent,
} from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { hubNav } from "../../playground/chrome.ts";
import AppNav from "./AppNav.svelte";

type Screen = Awaited<ReturnType<typeof renderIn>>;

const group = (screen: Screen, name: string) =>
  screen.getByRole("button", { name });

const SOFT_FILL = () => translucent(role("foreground", "dark"), 10);

describe("AppNav", () => {
  describe.each(["bar", "menu"] as const)("as a %s", (layout) => {
    test("is a navigation named Main, its top-level links and groups in order", async () => {
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        layout,
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
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        layout,
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

    test("marks the current page, and a page under it", async () => {
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        layout,
        current: "/events/42",
      });
      await expect
        .element(screen.getByRole("link", { name: "Events" }))
        .toHaveAttribute("aria-current", "page");
      expect(screen.container.querySelectorAll("[aria-current]")).toHaveLength(
        1,
      );
    });

    // Home is "/": every path starts with it, so it is current only on
    // itself.
    test("marks Home only on the home page", async () => {
      const home = await renderIn("light", AppNav, {
        items: hubNav,
        layout,
        current: "/",
      });
      await expect
        .element(home.getByRole("link", { name: "Home" }))
        .toHaveAttribute("aria-current", "page");
      home.unmount();

      const other = await renderIn("light", AppNav, {
        items: hubNav,
        layout,
        current: "/admin",
      });
      expect(other.container.querySelector("[aria-current]")).toBeNull();
    });

    // Training has "/teach" and "/teach/sessions": on the second, only it.
    test("marks the closest link when one sits under another", async () => {
      const screen = await renderIn("light", AppNav, {
        items: [
          { label: "My Students", href: "/teach" },
          { label: "Sessions", href: "/teach/sessions" },
        ],
        layout,
        current: "/teach/sessions/7",
      });
      await expect
        .element(screen.getByRole("link", { name: "Sessions" }))
        .toHaveAttribute("aria-current", "page");
      await expect
        .element(screen.getByRole("link", { name: "My Students" }))
        .not.toHaveAttribute("aria-current");
    });

    test("doesn't match a page that only shares the start of a link", async () => {
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        layout,
        current: "/eventsarchive",
      });
      expect(screen.container.querySelector("[aria-current]")).toBeNull();
    });

    test("takes another name for its navigation", async () => {
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        layout,
        label: "Training",
      });
      await expect
        .element(screen.getByRole("navigation", { name: "Training" }))
        .toBeInTheDocument();
    });

    test("gives every link, group and row a 44px target", async () => {
      const screen = await renderIn("light", AppNav, {
        items: [
          { label: "Go", href: "/go" },
          { label: "Up", children: [{ label: "In", href: "/in" }] },
        ],
        layout,
      });
      await group(screen, "Up").click();
      for (const name of ["Go", "In"]) {
        const box = screen.getByRole("link", { name }).element();
        expect(box.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
        expect(box.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
      }
      const box = group(screen, "Up").element().getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
    });

    test("puts a caller's class and attributes on the <nav>, and stays dark", async () => {
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        layout,
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

  describe("as a bar", () => {
    test("Escape closes an open group and puts focus back on its button", async () => {
      const screen = await renderIn("light", AppNav, { items: hubNav });
      await group(screen, "About").click();
      await userEvent.tab();
      await expect
        .element(screen.getByRole("link", { name: "Staff" }))
        .toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect
        .element(group(screen, "About"))
        .toHaveAttribute("aria-expanded", "false");
      await expect.element(group(screen, "About")).toHaveFocus();
    });

    test("a click outside closes an open group", async () => {
      const screen = await renderIn("light", AppNav, { items: hubNav });
      await group(screen, "About").click();
      await userEvent.click(document.body, { position: { x: 1, y: 1 } });
      await expect
        .element(group(screen, "About"))
        .toHaveAttribute("aria-expanded", "false");
    });

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

    test("closes a group when a link in it is followed", async () => {
      const screen = await renderIn("light", AppNav, {
        items: [{ label: "About", children: [{ label: "Staff", href: "#s" }] }],
      });
      await group(screen, "About").click();
      await screen.getByRole("link", { name: "Staff" }).click();
      await expect
        .element(group(screen, "About"))
        .toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("as a menu", () => {
    test("opens the group holding the current page from the start", async () => {
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        layout: "menu",
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

    // A phone menu lists the groups one under another: opening one leaves
    // the others as they are, and Escape is the phone menu's to handle.
    test("keeps groups open on another group, a click outside and Escape", async () => {
      const screen = await renderIn("light", AppNav, {
        items: hubNav,
        layout: "menu",
      });
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
  });

  // Dark in both schemes, so the dark roles everywhere.
  describe.each(SCHEMES)("in %s", (scheme) => {
    test("draws links and groups in the link colour, underlined only when current", async () => {
      const screen = await renderIn(scheme, AppNav, {
        items: hubNav,
        current: "/events",
      });
      const home = screen.getByRole("link", { name: "Home" });
      await expect.element(home).toHaveStyle({
        color: role("link", "dark"),
        backgroundColor: "rgba(0, 0, 0, 0)", // no fill
        textDecorationLine: "none",
      });
      await expect.element(group(screen, "About")).toHaveStyle({
        color: role("link", "dark"),
        textDecorationLine: "none",
      });
      await expect
        .element(screen.getByRole("link", { name: "Events" }))
        .toHaveStyle({
          color: role("link", "dark"),
          backgroundColor: SOFT_FILL(),
          textDecorationLine: "underline",
        });
      expectReadable(home.element(), "dark");
    });

    test("puts the soft fill on a group holding the current page, and on the page in it", async () => {
      const screen = await renderIn(scheme, AppNav, {
        items: hubNav,
        current: "/staff",
      });
      const about = group(screen, "About");
      await expect.element(about).toHaveStyle({
        backgroundColor: SOFT_FILL(),
        textDecorationLine: "underline",
      });
      await about.click();
      const panel = screen.getByRole("list").nth(1).element().parentElement!;
      await expect.element(panel).toHaveStyle({
        backgroundColor: role("card", "dark"),
        borderTopColor: role("border", "dark"),
      });
      const staff = screen.getByRole("link", { name: "Staff" });
      await expect.element(staff).toHaveStyle({
        color: role("link", "dark"),
        backgroundColor: SOFT_FILL(),
      });
      // On the panel's card.
      expectReadable(staff.element(), "dark");
      expectReadable(
        screen.getByRole("link", { name: "Partners" }).element(),
        "dark",
      );
    });

    test("shows a ring outline on a link tabbed to", async () => {
      const screen = await renderIn(scheme, AppNav, { items: hubNav });
      await userEvent.tab();
      const home = screen.getByRole("link", { name: "Home" });
      await expect.element(home).toHaveFocus();
      await expect.element(home).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", "dark"),
      });
    });
  });
});
