import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { expectReadable, SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Member from "./Member.svelte";
import InCell from "./Member.test.svelte";

const jordan = { name: "Jordan Sample", cid: 1000001 };

// The text on screen, its spacing tidied.
const shown = (element: Element) =>
  element.textContent!.replace(/\s+/g, " ").trim();

describe("Member", () => {
  test("shows the name, then the CID", async () => {
    const screen = await renderIn("light", Member, jordan);
    expect(shown(screen.container)).toBe("Jordan Sample · CID 1000001");
  });

  test("reads as the name and the CID, without the dot", async () => {
    const screen = await renderIn("light", InCell, jordan);
    await expect
      .element(screen.getByRole("cell"))
      .toHaveAccessibleName("Jordan Sample CID 1000001");
  });

  test("takes the CID as a string too", async () => {
    const screen = await renderIn("light", Member, {
      ...jordan,
      cid: "1000001",
    });
    expect(shown(screen.container)).toBe("Jordan Sample · CID 1000001");
  });

  test("shows the CID in mono", async () => {
    const screen = await renderIn("light", Member, jordan);
    const cid = screen.getByText("1000001").element();
    expect(getComputedStyle(cid).fontFamily).toMatch(/monospace/);
  });

  test("leaves the CID out with showCid off", async () => {
    const screen = await renderIn("light", Member, {
      ...jordan,
      showCid: false,
    });
    expect(shown(screen.container)).toBe("Jordan Sample");
  });

  // A name-private member: the app passes the first name, and nothing
  // takes the last name's place.
  test("shows the name as given", async () => {
    const screen = await renderIn("light", Member, {
      name: "Jordan",
      cid: 1000001,
      showCid: false,
    });
    expect(shown(screen.container)).toBe("Jordan");
  });

  describe("with an href", () => {
    test("links the name, and only the name", async () => {
      const screen = await renderIn("light", Member, {
        ...jordan,
        href: "/roster/1000001",
      });
      const link = screen.getByRole("link");
      await expect.element(link).toHaveAccessibleName("Jordan Sample");
      await expect.element(link).toHaveAttribute("href", "/roster/1000001");
    });

    test("draws the name as a Link", async () => {
      const screen = await renderIn("light", Member, {
        ...jordan,
        href: "/roster/1000001",
      });
      await expect
        .element(screen.getByRole("link"))
        .toHaveStyle({ color: role("link", "light") });
    });
  });

  test("has no link without an href", async () => {
    const screen = await renderIn("light", Member, jordan);
    await expect.element(screen.getByRole("link")).not.toBeInTheDocument();
  });

  describe.each(SCHEMES)("in %s", (scheme) => {
    // The guide's `muted-foreground`, readable on the page and a card.
    test("shows the CID muted, readable", async () => {
      const screen = await renderIn(scheme, Member, jordan);
      const cid = screen.getByText("1000001").element().parentElement!;
      await expect
        .element(page.elementLocator(cid))
        .toHaveStyle({ color: role("muted-foreground", scheme) });
      expectReadable(cid, scheme);
    });

    // The name takes the colour of the text around it.
    test("leaves the name in the surrounding colour", async () => {
      const screen = await renderIn(scheme, Member, jordan);
      const root = screen.container.firstElementChild!;
      expect(getComputedStyle(root).color).toBe(
        getComputedStyle(screen.container).color,
      );
    });
  });

  test("adds a caller's class and attributes to its root", async () => {
    const screen = await renderIn("light", Member, {
      ...jordan,
      class: "ml-4",
      id: "member",
    });
    const root = page.elementLocator(screen.container.firstElementChild!);
    await expect.element(root).toHaveAttribute("id", "member");
    await expect.element(root).toHaveStyle({ marginLeft: "16px" });
  });
});
