import { describe, expect, onTestFinished, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  SCHEMES,
  expectReadable,
  translucent,
} from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import AppsMenu from "./AppsMenu.svelte";
import { INDY_CENTER_APPS } from "./apps.ts";

const props = () => ({
  apps: INDY_CENTER_APPS,
  current: "https://training.flyindycenter.com",
});

const button = (screen: Awaited<ReturnType<typeof renderIn>>) =>
  screen.getByRole("button", { name: "Apps" });

describe("AppsMenu", () => {
  test("is a closed Apps button until pressed", async () => {
    const screen = await renderIn("light", AppsMenu, props());
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect
      .element(screen.getByRole("link", { name: /Library/ }))
      .not.toBeInTheDocument();
  });

  test("lists every app as a link once open", async () => {
    const screen = await renderIn("light", AppsMenu, props());
    await button(screen).click();
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "true");
    const links = screen.getByRole("link").elements();
    expect(links.map((a) => a.getAttribute("href"))).toEqual(
      INDY_CENTER_APPS.map((app) => app.href),
    );
    await expect
      .element(screen.getByRole("link", { name: /Library/ }))
      .toHaveAccessibleName("Library Courses for pilots and controllers");
  });

  test("lists the Indy Center apps the package ships", async () => {
    const screen = await renderIn("light", AppsMenu, {
      apps: INDY_CENTER_APPS,
      current: "https://library.flyindycenter.com",
    });
    await button(screen).click();
    const links = screen.getByRole("link");
    expect(links.elements().map((a) => a.getAttribute("href"))).toEqual([
      "https://flyindycenter.com",
      "https://training.flyindycenter.com",
      "https://library.flyindycenter.com",
      "https://charts.flyindycenter.com",
    ]);
    const names = [
      "Indy Center Events, roster, staff, feedback",
      "Training Your training, sessions, certifications",
      "Library Courses for pilots and controllers",
      "Charts Airport charts for your session",
    ];
    for (const [i, name] of names.entries())
      await expect.element(links.nth(i)).toHaveAccessibleName(name);
    await expect
      .element(screen.getByRole("link", { name: /Library/ }))
      .toHaveAttribute("aria-current", "true");
  });

  test("marks the current app, and only it", async () => {
    const screen = await renderIn("light", AppsMenu, props());
    await button(screen).click();
    await expect
      .element(screen.getByRole("link", { name: /Training/ }))
      .toHaveAttribute("aria-current", "true");
    expect(screen.container.querySelectorAll("[aria-current]")).toHaveLength(1);
  });

  test("ignores a trailing slash on current and on an app's href", async () => {
    const screen = await renderIn("light", AppsMenu, {
      apps: [
        { href: "https://x.example", label: "X" },
        { href: "https://y.example/", label: "Y" },
      ],
      current: "https://x.example/",
    });
    await button(screen).click();
    await expect
      .element(screen.getByRole("link", { name: "X" }))
      .toHaveAttribute("aria-current", "true");
    screen.unmount();

    const other = await renderIn("light", AppsMenu, {
      apps: [{ href: "https://y.example/", label: "Y" }],
      current: "https://y.example",
    });
    await button(other).click();
    await expect
      .element(other.getByRole("link", { name: "Y" }))
      .toHaveAttribute("aria-current", "true");
  });

  test("Escape closes it and puts focus back on the button", async () => {
    const screen = await renderIn("light", AppsMenu, props());
    await button(screen).click();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("link", { name: /Indy Center/ }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(button(screen)).toHaveFocus();
  });

  test("a click outside closes it", async () => {
    const screen = await renderIn("light", AppsMenu, props());
    await button(screen).click();
    await userEvent.click(document.body, { position: { x: 1, y: 1 } });
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "false");
  });

  // Focus leaves the link for nowhere; that isn't Tabbing away.
  test("stays open on a click on its panel's padding", async () => {
    const screen = await renderIn("light", AppsMenu, props());
    await button(screen).click();
    await userEvent.tab();
    const panel = screen.getByRole("list").element().parentElement!;
    await userEvent.click(panel, { position: { x: 2, y: 2 } });
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "true");
  });

  // Following a link changes the page; the menu shouldn't stay open on it.
  test("closes when a link in it is followed", async () => {
    const screen = await renderIn("light", AppsMenu, {
      apps: [{ href: "#library", label: "Library" }],
    });
    await button(screen).click();
    await screen.getByRole("link", { name: "Library" }).click();
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "false");
  });

  // A Ctrl-, Cmd- or Shift-click opens the link elsewhere; this page stays.
  test.each(["ctrlKey", "metaKey", "shiftKey"] as const)(
    "stays open when a link is opened elsewhere (%s)",
    async (key) => {
      const screen = await renderIn("light", AppsMenu, {
        apps: [{ href: "#library", label: "Library" }],
      });
      await button(screen).click();
      // Keep the test's page from opening a tab or window, which leaves it
      // throttled for the tests after. Only a cancelable click can be
      // stopped.
      const stop = (event: Event) => event.preventDefault();
      window.addEventListener("click", stop);
      onTestFinished(() => window.removeEventListener("click", stop));
      screen
        .getByRole("link", { name: "Library" })
        .element()
        .dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            [key]: true,
          }),
        );
      await expect
        .element(button(screen))
        .toHaveAttribute("aria-expanded", "true");
    },
  );

  test("gives the button and every row a 44px target", async () => {
    const screen = await renderIn("light", AppsMenu, {
      apps: [{ href: "/", label: "Hi" }],
    });
    await button(screen).click();
    for (const el of [
      button(screen).element(),
      screen.getByRole("link", { name: "Hi" }).element(),
    ]) {
      const box = el.getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    }
  });

  test("puts a caller's class and attributes on its root, and stays dark", async () => {
    const screen = await renderIn("light", AppsMenu, {
      ...props(),
      class: "ml-auto",
      id: "apps",
      "data-theme": "light",
    });
    const root = screen.container.querySelector("#apps")!;
    expect(root.classList).toContain("ml-auto");
    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  // Dark in both schemes, so the dark roles everywhere.
  describe.each(SCHEMES)("in %s", (scheme) => {
    test("draws the button soft, the panel a dark card", async () => {
      const screen = await renderIn(scheme, AppsMenu, props());
      await expect
        .element(button(screen))
        .toHaveStyle({ color: role("foreground-soft", "dark") });
      await button(screen).click();
      const panel = screen.getByRole("list").element().parentElement!;
      await expect.element(panel).toHaveStyle({
        backgroundColor: role("card", "dark"),
        borderTopColor: role("border", "dark"),
      });
    });

    test("draws apps in the link colour, the current one on the soft fill and underlined", async () => {
      const screen = await renderIn(scheme, AppsMenu, props());
      await button(screen).click();
      const library = screen.getByRole("link", { name: /Library/ });
      const training = screen.getByRole("link", { name: /Training/ });
      await expect.element(library).toHaveStyle({
        color: role("link", "dark"),
        backgroundColor: "rgba(0, 0, 0, 0)", // no fill
        textDecorationLine: "none",
      });
      await expect.element(training).toHaveStyle({
        color: role("link", "dark"),
        backgroundColor: translucent(role("foreground", "dark"), 10),
        textDecorationLine: "underline",
      });
      // On the panel's card.
      for (const el of [
        library.element(),
        training.element(),
        screen.getByText("Courses for pilots and controllers").element(),
      ]) {
        expectReadable(el, "dark");
      }
    });

    test("shows a ring outline on the button tabbed to", async () => {
      const screen = await renderIn(scheme, AppsMenu, props());
      await userEvent.tab();
      await expect.element(button(screen)).toHaveFocus();
      await expect.element(button(screen)).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", "dark"),
      });
    });
  });
});
