// How the menu opens and closes, its 44px targets and ring are
// HeaderMenu's, tested in headerMenu/HeaderMenu.test.ts.
import { mdiSchool } from "@mdi/js";
import { describe, expect, test } from "vitest";
import { expectReadable, translucent } from "../../../test/contrast.ts";
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
  test("is a closed Apps button that opens to list the Indy Center apps, the current one marked", async () => {
    const screen = await renderIn("light", AppsMenu, props());
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect
      .element(screen.getByRole("link", { name: /Library/ }))
      .not.toBeInTheDocument();

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

  test("draws an app's icon before its name, hidden from screen readers, and none for an app without one", async () => {
    const screen = await renderIn("light", AppsMenu, {
      apps: [
        { href: "#a", label: "A", icon: mdiSchool },
        { href: "#b", label: "B" },
      ],
    });
    await button(screen).click();
    const a = screen.getByRole("link", { name: "A" }).element();
    const icon = a.firstElementChild!;
    expect(icon.tagName).toBe("svg");
    expect(icon.querySelector("path")!.getAttribute("d")).toBe(mdiSchool);
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(
      screen.getByRole("link", { name: "B" }).element().querySelector("svg"),
    ).toBeNull();
  });

  // Its HeaderMenu is wired in.
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

  // Dark in both schemes: once, on a light page, in the dark roles.
  test("draws in the dark roles: the button soft, the panel a card, apps in the link colour, the current one on the soft fill", async () => {
    const screen = await renderIn("light", AppsMenu, props());
    await expect
      .element(button(screen))
      .toHaveStyle({ color: role("foreground-soft", "dark") });
    await button(screen).click();
    const panel = document.getElementById(
      button(screen).element().getAttribute("aria-controls")!,
    )!;
    await expect.element(panel).toHaveStyle({
      backgroundColor: role("card", "dark"),
      borderTopColor: role("border", "dark"),
    });
    const library = screen.getByRole("link", { name: /Library/ });
    const training = screen.getByRole("link", { name: /Training/ });
    await expect.element(library).toHaveStyle({
      color: role("foreground-soft", "dark"),
      backgroundColor: "rgba(0, 0, 0, 0)", // no fill
      textDecorationLine: "none",
    });
    await expect.element(training).toHaveStyle({
      color: role("foreground", "dark"),
      backgroundColor: translucent(role("foreground", "dark"), 10),
      textDecorationLine: "none",
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
});
