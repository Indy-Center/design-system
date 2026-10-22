// How the menu opens and closes, its 44px targets and ring are
// HeaderMenu's, tested in headerMenu/HeaderMenu.test.ts; the colour-scheme
// and time-zone choices are ColorSchemeSetting's and TimeZoneSetting's.
import { afterEach, describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { expectReadable } from "../../../test/contrast.ts";
import { savedColorScheme } from "../../../test/cookies.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { forgetColorScheme } from "../../playground/forgetColorScheme.ts";
import { forgetTimeZone } from "../../playground/forgetTimeZone.ts";
import UserMenu from "./UserMenu.svelte";

afterEach(() => {
  forgetColorScheme();
  forgetTimeZone();
});

const props = () => ({
  name: "Sam Rivera",
  cid: 1234567,
  rating: "S3",
  pilotRating: 1,
  signOutHref: "https://auth.flyindycenter.com/logout",
});

type Screen = Awaited<ReturnType<typeof renderIn>>;

const button = (screen: Screen) =>
  screen.getByRole("button", { name: "Account: Sam Rivera" });

/** The panel the button controls. */
const panel = (screen: Screen) =>
  document.getElementById(
    button(screen).element().getAttribute("aria-controls")!,
  )!;

describe("UserMenu", () => {
  test("is a closed round button showing the member's initials, named for their account", async () => {
    const screen = await renderIn("light", UserMenu, props());
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(button(screen)).toHaveTextContent("SR");
    await expect.element(panel(screen)).not.toBeVisible();
  });

  test("opens to the member's name, CID and ratings", async () => {
    const screen = await renderIn("light", UserMenu, props());
    await button(screen).click();
    await expect.element(panel(screen)).toBeVisible();
    await expect.element(screen.getByText("Sam Rivera")).toBeVisible();
    await expect.element(screen.getByText("CID 1234567")).toBeVisible();
    // Each read with what it is; the code and long name are Rating's.
    const text = panel(screen).textContent!.replace(/\s+/g, " ");
    expect(text).toContain("ATC rating S3 Senior Student");
    expect(text).toContain("Pilot rating PPL Private Pilot License");
  });

  test("leaves out a rating not given, and a pilot rating of none (VATSIM's 0)", async () => {
    const screen = await renderIn("light", UserMenu, {
      ...props(),
      rating: undefined,
      pilotRating: 0,
    });
    await button(screen).click();
    expect(panel(screen).textContent).not.toMatch(/rating|NEW/);
  });

  test("links My profile and Settings on the hub, and Sign out where the app says", async () => {
    const screen = await renderIn("light", UserMenu, props());
    await button(screen).click();
    const links = screen.getByRole("link");
    expect(
      links.elements().map((a) => [a.textContent, a.getAttribute("href")]),
    ).toEqual([
      ["My profile", "https://flyindycenter.com/profile"],
      ["Settings", "https://flyindycenter.com/settings"],
      ["Sign out", "https://auth.flyindycenter.com/logout"],
    ]);
  });

  test("takes another address for the hub, a trailing slash or not", async () => {
    const screen = await renderIn("light", UserMenu, {
      ...props(),
      hub: "http://localhost:5173/",
    });
    await button(screen).click();
    await expect
      .element(screen.getByRole("link", { name: "My profile" }))
      .toHaveAttribute("href", "http://localhost:5173/profile");
  });

  test("holds the time-zone and colour-scheme choices", async () => {
    const screen = await renderIn("light", UserMenu, props());
    await button(screen).click();
    await expect
      .element(screen.getByRole("group", { name: "Time zone" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("group", { name: "Colour scheme" }))
      .toBeVisible();
  });

  test("choosing a colour scheme saves the cookie and applies it, leaving the menu open", async () => {
    const screen = await renderIn("light", UserMenu, props());
    await button(screen).click();
    await screen.getByRole("button", { name: "Light", exact: true }).click();
    expect(savedColorScheme()).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
    await expect
      .element(screen.getByRole("button", { name: "Light", exact: true }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "true");
  });

  test("shows an account icon on the button when the name has no letters", async () => {
    const screen = await renderIn("light", UserMenu, { ...props(), name: "" });
    const button = screen.getByRole("button", { name: "Account:" });
    expect(button.element().textContent!.trim()).toBe("");
    expect(button.element().querySelector("svg")).not.toBeNull();
  });

  test("puts a caller's class and attributes on its root, and stays dark", async () => {
    const screen = await renderIn("light", UserMenu, {
      ...props(),
      class: "ml-2",
      id: "user",
      "data-theme": "light",
    });
    const root = screen.container.querySelector("#user")!;
    expect(root.classList).toContain("ml-2");
    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  // Dark in both schemes: once, on a light page, in the dark roles.
  test("draws in the dark roles: initials on primary, the panel a card, links in the link colour, Sign out destructive", async () => {
    const screen = await renderIn("light", UserMenu, props());
    const circle = screen.getByText("SR", { exact: true }).first();
    await expect.element(circle).toHaveStyle({
      backgroundColor: role("primary", "dark"),
      color: role("primary-foreground", "dark"),
    });
    await button(screen).click();
    await expect.element(panel(screen)).toHaveStyle({
      backgroundColor: role("card", "dark"),
      borderTopColor: role("border", "dark"),
    });
    await expect
      .element(screen.getByText("Sam Rivera"))
      .toHaveStyle({ color: role("foreground", "dark") });
    const cid = screen.getByText("CID 1234567");
    await expect
      .element(cid)
      .toHaveStyle({ color: role("muted-foreground", "dark") });
    const profile = screen.getByRole("link", { name: "My profile" });
    await expect.element(profile).toHaveStyle({ color: role("link", "dark") });
    const signOut = screen.getByRole("link", { name: "Sign out" });
    await expect.element(signOut).toHaveStyle({
      color: role("destructive", "dark"),
      textDecorationLine: "none",
    });
    for (const el of [cid, profile, signOut])
      expectReadable(el.element(), "dark");
    await signOut.hover();
    await expect
      .element(signOut)
      .toHaveStyle({ textDecorationLine: "underline" });
  });

  test("gives Sign out a 44px target and a ring outline", async () => {
    const screen = await renderIn("light", UserMenu, props());
    // Opened by keyboard, so the focus below shows its ring.
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    const signOut = screen.getByRole("link", { name: "Sign out" });
    const box = signOut.element().getBoundingClientRect();
    expect(box.height).toBeGreaterThanOrEqual(44);
    signOut.element().focus();
    await expect.element(signOut).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "dark"),
    });
  });

  test("works by keyboard: Enter opens it, Tab reaches its links and choices, Escape closes it", async () => {
    const screen = await renderIn("light", UserMenu, props());
    await userEvent.tab();
    await expect.element(button(screen)).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "true");
    await userEvent.tab(); // S3, focusable for its long name
    await userEvent.tab(); // PPL
    await userEvent.tab();
    await expect
      .element(screen.getByRole("link", { name: "My profile" }))
      .toHaveFocus();
    await userEvent.tab();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("button", { name: "Zulu" }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(button(screen))
      .toHaveAttribute("aria-expanded", "false");
    await expect.element(button(screen)).toHaveFocus();
  });
});
