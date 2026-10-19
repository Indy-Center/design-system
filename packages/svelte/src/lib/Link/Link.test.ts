import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Link from "./Link.svelte";

const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

describe("Link", () => {
  test("is a link to its href, named by its text", async () => {
    const screen = await renderIn("light", Link, {
      href: "/events",
      children: text("Events"),
    });
    const link = screen.getByRole("link", { name: "Events" });
    await expect.element(link).toHaveAttribute("href", "/events");
  });

  // The guide's `link` role: #0369A1 light, #38BDF8 dark.
  test.each([
    ["light", "rgb(3, 105, 161)"],
    ["dark", "rgb(56, 189, 248)"],
    ["dark-header", "rgb(56, 189, 248)"],
  ] as const)("is the link colour in %s", async (scheme, colour) => {
    const screen = await renderIn(scheme, Link, {
      href: "/events",
      children: text("Events"),
    });
    await expect
      .element(screen.getByRole("link"))
      .toHaveStyle({ color: colour });
  });

  // Colour alone doesn't mark a link in body text (WCAG 1.4.1).
  test("is underlined", async () => {
    const screen = await renderIn("light", Link, {
      href: "/events",
      children: text("Events"),
    });
    await expect
      .element(screen.getByRole("link"))
      .toHaveStyle({ textDecorationLine: "underline" });
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Link, {
      href: "https://discord.indy.center",
      target: "_blank",
      class: "ml-4",
      children: text("Discord"),
    });
    const link = screen.getByRole("link");
    await expect.element(link).toHaveAttribute("target", "_blank");
    await expect.element(link).toHaveStyle({
      marginLeft: "16px",
      textDecorationLine: "underline",
    });
  });

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Link, {
        href: "/events",
        children: text("Events"),
      });
      await userEvent.tab();
      const link = screen.getByRole("link");
      await expect.element(link).toHaveFocus();
      await expect.element(link).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );
});
