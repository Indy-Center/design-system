import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import { SCHEMES, expectReadable } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Footer, { type FooterColumn } from "./Footer.svelte";

const columns: FooterColumn[] = [
  {
    heading: "Apps",
    links: [
      { href: "https://flyindycenter.com", label: "Community" },
      { href: "https://training.flyindycenter.com", label: "Training" },
    ],
  },
  {
    heading: "Help",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "https://discord.indy.center", label: "Discord" },
    ],
  },
];

describe("Footer", () => {
  // A <footer> is the page's contentinfo landmark only outside <main> and
  // the sectioning elements, which is where an app's layout puts it.
  test("is the page's contentinfo landmark", async () => {
    const screen = await render(Footer, { columns });
    await expect.element(screen.getByRole("contentinfo")).toBeVisible();
  });

  test("maps its links in a navigation named Footer", async () => {
    const screen = await render(Footer, { columns });
    const nav = screen.getByRole("navigation", { name: "Footer" });
    await expect
      .element(nav.getByRole("link", { name: "Training" }))
      .toHaveAttribute("href", "https://training.flyindycenter.com");
    await expect
      .element(nav.getByRole("link", { name: "Contact us" }))
      .toHaveAttribute("href", "/contact");
    expect(nav.getByRole("link").elements()).toHaveLength(4);
  });

  test("heads each column, its links listed under it", async () => {
    const screen = await render(Footer, { columns });
    await expect
      .element(screen.getByRole("heading", { level: 2, name: "Help" }))
      .toBeVisible();
    const help = screen.getByRole("list").nth(1);
    expect(
      help
        .getByRole("link")
        .elements()
        .map((a) => a.textContent),
    ).toEqual(["Contact us", "Discord"]);
  });

  test("takes another name for its navigation", async () => {
    const screen = await render(Footer, { columns, label: "Indy Center" });
    await expect
      .element(screen.getByRole("navigation", { name: "Indy Center" }))
      .toBeVisible();
  });

  test("shows the logo, the FAA disclaimer and this year's copyright", async () => {
    const screen = await render(Footer, { columns });
    await expect
      .element(screen.getByRole("img", { name: "Indy Center" }))
      .toBeVisible();
    await expect
      .element(
        screen.getByText(
          /not affiliated with the Federal Aviation Administration/,
        ),
      )
      .toBeVisible();
    await expect
      .element(
        screen.getByText(`Copyright ${new Date().getFullYear()} Indy Center`),
      )
      .toBeVisible();
  });

  // Two footers on one page keep the logo's masks apart, so each draws.
  test("gives each logo its own mask ids", async () => {
    const one = await render(Footer, { columns });
    const two = await render(Footer, { columns });
    const ids = (c: HTMLElement) =>
      [...c.querySelectorAll("svg [id]")].map((e) => e.id);
    const all = [...ids(one.container), ...ids(two.container)];
    expect(all).toHaveLength(6);
    expect(new Set(all).size).toBe(6);
  });

  test("draws two links to the same page", async () => {
    const screen = await render(Footer, {
      columns: [
        {
          heading: "Policies",
          links: [
            { href: "/soon", label: "Privacy" },
            { href: "/soon", label: "Accessibility" },
          ],
        },
      ],
    });
    expect(screen.getByRole("link").elements()).toHaveLength(2);
  });

  test("stays dark when a caller passes its own data-theme", async () => {
    const screen = await render(Footer, {
      columns,
      "data-theme": "light",
    });
    await expect
      .element(screen.getByRole("contentinfo"))
      .toHaveAttribute("data-theme", "dark");
  });

  test("puts a caller's class and attributes on the <footer>", async () => {
    const screen = await render(Footer, {
      columns,
      class: "mt-12",
      id: "site-footer",
    });
    const footer = screen.getByRole("contentinfo");
    await expect.element(footer).toHaveAttribute("id", "site-footer");
    await expect.element(footer).toHaveStyle({ marginTop: "48px" });
  });

  test("gives each link a 44px target", async () => {
    const screen = await render(Footer, {
      columns: [{ heading: "Apps", links: [{ href: "/", label: "Hi" }] }],
    });
    const box = screen.getByRole("link", { name: "Hi" }).element();
    expect(box.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    expect(box.getBoundingClientRect().width).toBeGreaterThanOrEqual(44);
  });

  // Dark in both schemes, so the dark roles everywhere.
  describe.each(SCHEMES)("in %s", (scheme) => {
    const footerIn = async () => {
      const screen = await renderIn(scheme, Footer, { columns });
      return { screen, footer: screen.container.querySelector("footer")! };
    };

    test("is the dark background with a border on top", async () => {
      const { footer } = await footerIn();
      await expect.element(footer).toHaveStyle({
        backgroundColor: role("background", "dark"),
        borderTopColor: role("border", "dark"),
      });
    });

    test("draws links soft, headings and fine print muted, the logo white", async () => {
      const { screen } = await footerIn();
      await expect
        .element(screen.getByRole("link", { name: "Discord" }))
        .toHaveStyle({ color: role("foreground-soft", "dark") });
      await expect
        .element(screen.getByRole("heading", { name: "Apps" }))
        .toHaveStyle({ color: role("muted-foreground", "dark") });
      const disclaimer = screen.getByText(/not affiliated/);
      await expect
        .element(disclaimer)
        .toHaveStyle({ color: role("muted-foreground", "dark") });
      await expect
        .element(disclaimer.element().parentElement!)
        .toHaveStyle({ borderTopColor: role("border", "dark") });
      await expect
        .element(screen.getByRole("img", { name: "Indy Center" }))
        .toHaveStyle({ color: role("foreground", "dark") });
    });

    test("keeps its text readable", async () => {
      const { screen } = await footerIn();
      for (const el of [
        screen.getByRole("link", { name: "Discord" }).element(),
        screen.getByRole("heading", { name: "Apps" }).element(),
        screen.getByText(/not affiliated/).element(),
      ]) {
        expectReadable(el, "dark");
      }
    });

    test("shows a ring outline on a link tabbed to", async () => {
      const { screen } = await footerIn();
      await userEvent.tab();
      const link = screen.getByRole("link", { name: "Community" });
      await expect.element(link).toHaveFocus();
      await expect.element(link).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", "dark"),
      });
    });
  });
});
