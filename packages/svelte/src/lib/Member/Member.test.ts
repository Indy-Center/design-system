import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import { expectReadable } from "../../../test/contrast.ts";
import InCell from "../../../test/InCell.svelte";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Member from "./Member.svelte";

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
    const screen = await renderIn("light", InCell, {
      component: Member,
      props: jordan,
    });
    await expect
      .element(screen.getByRole("cell"))
      .toHaveAccessibleName("Jordan Sample CID 1000001");
  });

  test("shows the CID in mono", async () => {
    const screen = await renderIn("light", Member, jordan);
    const cid = screen.getByText("1000001").element();
    expect(getComputedStyle(cid).fontFamily).toMatch(/monospace/);
  });

  // In a narrow card, "CID" at a line's end and the number on the next
  // read as two things.
  test("keeps the CID and its label on one line", async () => {
    const screen = await renderIn("light", Member, jordan);
    const cid = screen.getByText("1000001").element().parentElement!;
    expect(getComputedStyle(cid).whiteSpace).toBe("nowrap");
  });

  // A name-private member: the app passes the first name, and nothing
  // takes the last name's place.
  test("leaves the CID out with showCid off, the name as given", async () => {
    const screen = await renderIn("light", Member, {
      name: "Jordan",
      cid: 1000001,
      showCid: false,
    });
    expect(shown(screen.container)).toBe("Jordan");
  });

  // Link's own look is Link.test.ts's: this checks the name is a Link.
  test("with an href, links the name, and only the name, as a Link", async () => {
    const screen = await renderIn("light", Member, {
      ...jordan,
      href: "/roster/1000001",
    });
    const link = screen.getByRole("link");
    await expect.element(link).toHaveAccessibleName("Jordan Sample");
    await expect.element(link).toHaveAttribute("href", "/roster/1000001");
    await expect.element(link).toHaveStyle({ color: role("link", "light") });
  });

  test("has no link without an href", async () => {
    const screen = await renderIn("light", Member, jordan);
    await expect.element(screen.getByRole("link")).not.toBeInTheDocument();
  });

  // The guide's `muted-foreground`, readable on the page and a card.
  test("shows the CID muted, readable", async () => {
    const screen = await renderIn("light", Member, jordan);
    const cid = screen.getByText("1000001").element().parentElement!;
    await expect
      .element(page.elementLocator(cid))
      .toHaveStyle({ color: role("muted-foreground", "light") });
    expectReadable(cid, "light");
  });

  // The name takes the colour of the text around it: a colour the test
  // sets on the page, not a role.
  test("leaves the name in the surrounding colour", async () => {
    const screen = await renderIn("light", Member, jordan);
    screen.container.style.color = "rgb(1, 2, 3)";
    await expect
      .element(page.elementLocator(screen.container.firstElementChild!))
      .toHaveStyle({ color: "rgb(1, 2, 3)" });
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
