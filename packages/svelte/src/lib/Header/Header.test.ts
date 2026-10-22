import type { ComponentProps } from "svelte";
import { afterEach, describe, expect, onTestFinished, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import { role } from "../../../test/roles.ts";
import { hubNav } from "../../playground/chrome.ts";
import { INDY_CENTER_APPS } from "../AppsMenu/apps.ts";
import Header from "./Header.svelte";

type Props = ComponentProps<typeof Header>;

const training = INDY_CENTER_APPS[1];
const member = { name: "Sam Rivera", cid: 1234567, rating: "S3" };

const base: Props = {
  signInHref: "https://auth.flyindycenter.com/login?return_url=here",
  signOutHref: "https://auth.flyindycenter.com/logout?return_url=here",
};

// `render` puts it on the light page outside <main>, where an app's layout
// puts it: inside <main> a <header> isn't the banner landmark.
const renderHeader = (props: Partial<Props> = {}) =>
  render(Header, { ...base, ...props });

describe("Header", () => {
  afterEach(() => page.viewport(414, 896));

  test("is the page's banner landmark, the skip link its first Tab stop", async () => {
    const screen = await renderHeader();
    await expect.element(screen.getByRole("banner")).toBeInTheDocument();
    await userEvent.tab();
    const skip = screen.getByRole("link", { name: "Skip to content" });
    await expect.element(skip).toHaveFocus();
    await expect.element(skip).toHaveAttribute("href", "#main");

    await screen.rerender({ skipTo: "#content" });
    await expect.element(skip).toHaveAttribute("href", "#content");
  });

  test("on the hub, shows the logo alone, to the hub, and marks the hub in Apps", async () => {
    const screen = await renderHeader();
    await expect
      .element(screen.getByRole("link", { name: "Indy Center home" }))
      .toHaveAttribute("href", "https://flyindycenter.com");
    // The logo link, then the Apps button: no app name between.
    expect(
      screen
        .getByRole("banner")
        .getByRole("link")
        .elements()
        .map(
          (a) =>
            a.getAttribute("aria-label") ??
            a.textContent?.replace(/\s+/g, " ").trim(),
        ),
    ).toEqual(["Skip to content", "Indy Center home", "Sign in with VATSIM"]);
    await screen.getByRole("button", { name: "Apps" }).click();
    await expect
      .element(screen.getByRole("link", { name: /^Indy Center Events/ }))
      .toHaveAttribute("aria-current", "true");
  });

  test("in an app, the logo goes to the hub and the app's name to its home, marked in Apps", async () => {
    const screen = await renderHeader({
      app: training,
      hub: "https://hub.test",
    });
    await expect
      .element(screen.getByRole("link", { name: "Indy Center home" }))
      .toHaveAttribute("href", "https://hub.test");
    await expect
      .element(screen.getByRole("link", { name: "Training", exact: true }))
      .toHaveAttribute("href", training.href);
    await screen.getByRole("button", { name: "Apps" }).click();
    await expect
      .element(screen.getByRole("link", { name: /^Training Your training/ }))
      .toHaveAttribute("aria-current", "true");
  });

  test("shows the mark on phones and the full logo from sm", async () => {
    await page.viewport(390, 844);
    const screen = await renderHeader();
    const logo = screen.getByRole("link", { name: "Indy Center home" });
    const shown = () =>
      [...logo.element().querySelectorAll("svg")].filter(
        (svg) => svg.getBoundingClientRect().width > 0,
      );
    // The mark is about as wide as it is tall; the logo three times wider.
    expect(shown()).toHaveLength(1);
    const mark = shown()[0].getBoundingClientRect();
    expect(mark.width).toBeLessThan(mark.height);

    await page.viewport(768, 1024);
    expect(shown()).toHaveLength(1);
    const full = shown()[0].getBoundingClientRect();
    expect(full.width).toBeGreaterThan(full.height * 3);
  });

  test("signed out, shows Sign in with VATSIM, to identity", async () => {
    const screen = await renderHeader();
    await expect
      .element(screen.getByRole("link", { name: "Sign in with VATSIM" }))
      .toHaveAttribute("href", base.signInHref);
    expect(
      screen.getByRole("button", { name: /^Account/ }).elements(),
    ).toHaveLength(0);
  });

  test("signed in, shows the member's UserMenu, signing out to identity", async () => {
    const screen = await renderHeader({ member });
    const account = screen.getByRole("button", { name: "Account: Sam Rivera" });
    await expect.element(account).toBeVisible();
    expect(
      screen.getByRole("link", { name: /Sign in/ }).elements(),
    ).toHaveLength(0);
    await account.click();
    await expect
      .element(screen.getByRole("link", { name: "Sign out" }))
      .toHaveAttribute("href", base.signOutHref);
    await expect
      .element(screen.getByRole("link", { name: "My profile" }))
      .toHaveAttribute("href", "https://flyindycenter.com/profile");
  });

  test("from lg, shows the nav in the bar, the current page marked, and no Menu button", async () => {
    await page.viewport(1280, 800);
    const screen = await renderHeader({
      app: training,
      nav: hubNav,
      current: "/events",
    });
    const nav = screen.getByRole("navigation", { name: "Main" });
    await expect.element(nav).toBeVisible();
    await expect
      .element(nav.getByRole("link", { name: "Events" }))
      .toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("button", { name: "Menu" }).elements(),
    ).toHaveLength(0);
    // Tab order: skip link, logo, name, then the nav.
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await userEvent.tab();
    await expect.element(nav.getByRole("link", { name: "Home" })).toHaveFocus();
  });

  test("from lg, holds the logo and name in 16rem, cutting a long name short", async () => {
    await page.viewport(1280, 800);
    const name = "Controller Training and Certification Records";
    const screen = await renderHeader({
      app: { href: "/", label: name },
      nav: hubNav,
    });
    const link = screen.getByRole("link", { name });
    await expect.element(link).toHaveAttribute("title", name);
    const text = link.element().firstElementChild as HTMLElement;
    expect(getComputedStyle(text).textOverflow).toBe("ellipsis");
    expect(text.scrollWidth).toBeGreaterThan(text.clientWidth);
    const brand = link.element().parentElement!.getBoundingClientRect();
    expect(brand.width).toBe(256);
    // The nav starts right after it.
    const nav = screen.getByRole("navigation", { name: "Main" }).element();
    expect(nav.getBoundingClientRect().left).toBeGreaterThanOrEqual(
      brand.right,
    );
  });

  // The longest bar: the hub's nav and the Sign in button beside it.
  test.each([390, 768, 1024, 1280])(
    "fits the bar in the window at %ipx, signed out with the hub's nav",
    async (width) => {
      await page.viewport(width, 800);
      const screen = await renderHeader({ app: training, nav: hubNav });
      const signIn = screen.getByRole("link", { name: "Sign in with VATSIM" });
      await expect.element(signIn).toBeVisible();
      expect(
        signIn.element().getBoundingClientRect().right,
      ).toBeLessThanOrEqual(width);
    },
  );

  test.each([390, 768, 1280])("is 64px tall at %ipx", async (width) => {
    await page.viewport(width, 800);
    const screen = await renderHeader({ app: training, nav: hubNav, member });
    // The bar, plus the 1px line under it.
    expect(
      screen.getByRole("banner").element().getBoundingClientRect().height,
    ).toBe(65);
  });

  describe("below lg, the phone menu", () => {
    async function phone(props: Partial<Props> = {}) {
      await page.viewport(390, 844);
      const screen = await renderHeader({
        app: training,
        nav: hubNav,
        current: "/staff",
        ...props,
      });
      const button = screen.getByRole("button", { name: "Menu" });
      return { screen, button };
    }
    const mainNav = (screen: Awaited<ReturnType<typeof renderHeader>>) =>
      screen.getByRole("navigation", { name: "Main" });

    test("hides the bar's nav and opens the nav from a Menu button, by keyboard", async () => {
      const { screen, button } = await phone();
      await expect.element(button).toHaveAttribute("aria-expanded", "false");
      // Neither the bar's nav nor the closed menu's is showing.
      expect(mainNav(screen).elements()).toHaveLength(0);

      button.element().focus();
      await userEvent.keyboard("{Enter}");
      await expect.element(button).toHaveAttribute("aria-expanded", "true");
      await expect.element(mainNav(screen)).toBeVisible();
      // The group holding the current page is open, the page marked.
      await expect
        .element(mainNav(screen).getByRole("link", { name: "Staff" }))
        .toHaveAttribute("aria-current", "page");

      await userEvent.tab();
      await expect
        .element(mainNav(screen).getByRole("link", { name: "Home" }))
        .toHaveFocus();
    });

    test("Escape closes it and puts focus back on the Menu button", async () => {
      const { screen, button } = await phone();
      await button.click();
      await userEvent.tab(); // Home
      await userEvent.tab(); // Events
      await userEvent.tab(); // the Controlling group
      await expect
        .element(mainNav(screen).getByRole("button", { name: "Controlling" }))
        .toHaveFocus();
      await userEvent.keyboard("{Escape}");
      await expect.element(button).toHaveAttribute("aria-expanded", "false");
      await expect.element(button).toHaveFocus();
    });

    test("a group opens and closes in it, without closing the menu", async () => {
      const { screen, button } = await phone();
      await button.click();
      const group = mainNav(screen).getByRole("button", { name: "Flying" });
      await group.click();
      await expect.element(group).toHaveAttribute("aria-expanded", "true");
      await expect
        .element(mainNav(screen).getByRole("link", { name: "Feedback" }))
        .toBeVisible();
      await expect.element(button).toHaveAttribute("aria-expanded", "true");
    });

    test("a click outside closes it", async () => {
      const { button } = await phone();
      await button.click();
      await userEvent.click(document.body, { position: { x: 200, y: 830 } });
      await expect.element(button).toHaveAttribute("aria-expanded", "false");
    });

    test("following a link in it closes it", async () => {
      const { screen, button } = await phone();
      // Keep the test's page where it is.
      const stop = (event: Event) => event.preventDefault();
      window.addEventListener("click", stop);
      onTestFinished(() => window.removeEventListener("click", stop));
      await button.click();
      await mainNav(screen).getByRole("link", { name: "Events" }).click();
      await expect.element(button).toHaveAttribute("aria-expanded", "false");
    });

    test("Tabbing out of it closes it; back to its button doesn't", async () => {
      const { screen, button } = await phone({
        nav: [{ label: "Events", href: "/events" }],
      });
      const after = document.createElement("a");
      after.href = "#after";
      after.textContent = "After";
      document.body.append(after);
      try {
        await button.click();
        await userEvent.tab(); // Events
        await userEvent.tab({ shift: true }); // back to Menu
        await expect.element(button).toHaveFocus();
        await expect.element(button).toHaveAttribute("aria-expanded", "true");
        await userEvent.tab(); // Events
        await userEvent.tab(); // After, outside
        await expect
          .element(screen.getByRole("link", { name: "After" }))
          .toHaveFocus();
        await expect.element(button).toHaveAttribute("aria-expanded", "false");
      } finally {
        after.remove();
      }
    });

    test("isn't there without nav", async () => {
      await page.viewport(390, 844);
      const screen = await renderHeader({ app: training });
      expect(
        screen.getByRole("button", { name: "Menu" }).elements(),
      ).toHaveLength(0);
      expect(screen.getByRole("navigation").elements()).toHaveLength(0);
    });
  });

  test("puts a caller's class and attributes on the <header>, and stays dark", async () => {
    const screen = await renderHeader({
      class: "mb-6",
      id: "site-header",
      "data-theme": "light",
    });
    const header = screen.getByRole("banner");
    await expect.element(header).toHaveAttribute("id", "site-header");
    await expect.element(header).toHaveStyle({ marginBottom: "24px" });
    await expect.element(header).toHaveAttribute("data-theme", "dark");
  });

  // Dark in both schemes: once, on a light page, in the dark roles.
  test("draws in the dark roles: the background lined below, the logo and name white", async () => {
    const screen = await renderHeader({ app: training });
    await expect.element(screen.getByRole("banner")).toHaveStyle({
      backgroundColor: role("background", "dark"),
      borderBottomColor: role("border", "dark"),
    });
    await expect
      .element(screen.getByRole("link", { name: "Training", exact: true }))
      .toHaveStyle({ color: role("foreground", "dark") });
    // The mark and the logo, whichever shows.
    for (const svg of screen
      .getByRole("link", { name: "Indy Center home" })
      .element()
      .querySelectorAll("svg")) {
      expect(getComputedStyle(svg).color).toBe(role("foreground", "dark"));
    }
  });

  test("shows a ring outline on the logo link tabbed to", async () => {
    const screen = await renderHeader();
    await userEvent.tab();
    await userEvent.tab();
    const logo = screen.getByRole("link", { name: "Indy Center home" });
    await expect.element(logo).toHaveFocus();
    await expect.element(logo).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "dark"),
    });
  });
});
