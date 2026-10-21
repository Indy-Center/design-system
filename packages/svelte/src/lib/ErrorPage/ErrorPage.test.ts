import { mdiCalendar } from "@mdi/js";
import { afterEach, describe, expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";
import { expectReadable, translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import ErrorPage from "./ErrorPage.svelte";

// What an app's +error.svelte passes from `page`.
const notFound = { status: 404, message: "Not Found", path: "/evnts" };
const serverError = { status: 500, message: "Internal Error" };

afterEach(() => vi.restoreAllMocks());

/** The tab's history as `entries` long, and `history.back()` a spy. */
function withHistory(entries: number) {
  vi.spyOn(history, "length", "get").mockReturnValue(entries);
  return vi.spyOn(history, "back").mockImplementation(() => {});
}

describe("ErrorPage", () => {
  test("titles a missing page with the page's one h1", async () => {
    const screen = await renderIn("light", ErrorPage, notFound);
    const headings = screen.getByRole("heading").elements();
    expect(headings).toHaveLength(1);
    await expect
      .element(screen.getByRole("heading", { level: 1 }))
      .toHaveTextContent("Radar contact lost");
  });

  // A load's own 404 message ("Partner not found") says more than ours.
  test("titles a missing page with the load's message when it has one", async () => {
    const screen = await renderIn("light", ErrorPage, {
      ...notFound,
      message: "Partner not found",
    });
    await expect
      .element(screen.getByRole("heading", { level: 1 }))
      .toHaveTextContent("Partner not found");
  });

  test("titles any other error as something gone wrong, with its message", async () => {
    const screen = await renderIn("light", ErrorPage, serverError);
    await expect
      .element(screen.getByRole("heading", { level: 1 }))
      .toHaveTextContent("Something went wrong");
    await expect
      .element(screen.getByText(/Internal Error/))
      .toHaveTextContent("Internal Error. Please try again in a moment.");
  });

  // SvelteKit's messages have no full stop; a load's own may.
  test("ends the message with one full stop", async () => {
    const screen = await renderIn("light", ErrorPage, {
      status: 503,
      message: "The roster is down for maintenance.",
    });
    await expect
      .element(screen.getByText(/maintenance/))
      .toHaveTextContent(
        "The roster is down for maintenance. Please try again in a moment.",
      );
  });

  test("shows the status above the title", async () => {
    const screen = await renderIn("light", ErrorPage, notFound);
    const status = screen.getByText("404", { exact: true }).element();
    const heading = screen.getByRole("heading", { level: 1 }).element();
    expect(
      status.compareDocumentPosition(heading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("shows the missing path, and none for other errors", async () => {
    const screen = await renderIn("light", ErrorPage, notFound);
    await expect.element(screen.getByText("/evnts")).toBeVisible();
    const other = await renderIn("light", ErrorPage, {
      ...serverError,
      path: "/admin",
    });
    expect(other.getByText("/admin").elements()).toHaveLength(0);
  });

  test("links home as “Return home”, to / by default or the app's home", async () => {
    const screen = await renderIn("light", ErrorPage, notFound);
    await expect
      .element(screen.getByRole("link", { name: "Return home" }))
      .toHaveAttribute("href", "/");
    const library = await renderIn("light", ErrorPage, {
      ...notFound,
      home: "/courses",
    });
    await expect
      .element(library.getByRole("link", { name: "Return home" }))
      .toHaveAttribute("href", "/courses");
  });

  // A tab opened on the broken link has nowhere to go back to.
  test("has no “Go back” when the tab has no page before this one", async () => {
    withHistory(1);
    const screen = await renderIn("light", ErrorPage, serverError);
    await expect
      .element(screen.getByRole("link", { name: "Return home" }))
      .toBeVisible();
    expect(screen.getByRole("button").elements()).toHaveLength(0);
  });

  test("reaches Return home, then Go back, which goes back a page", async () => {
    const back = withHistory(2);
    const screen = await renderIn("light", ErrorPage, serverError);
    await userEvent.tab();
    await expect
      .element(screen.getByRole("link", { name: "Return home" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("button", { name: "Go back" }))
      .toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(back).toHaveBeenCalledOnce();
  });

  // A static list, not keyed: two pages at one address don't throw.
  test("offers the app's other pages on a missing page, in a named nav", async () => {
    const links = [
      { label: "Events", href: "/events", icon: mdiCalendar },
      { label: "Calendar", href: "/events" },
      { label: "Roster", href: "/roster" },
    ];
    const screen = await renderIn("light", ErrorPage, { ...notFound, links });
    const nav = screen.getByRole("navigation", { name: "Or try one of these" });
    expect(nav.getByRole("link").elements()).toHaveLength(3);
    await expect
      .element(nav.getByRole("link", { name: "Events" }))
      .toHaveAttribute("href", "/events");
    await expect
      .element(nav.getByRole("link", { name: "Calendar" }))
      .toHaveAttribute("href", "/events");
    await expect
      .element(nav.getByRole("link", { name: "Roster" }))
      .toHaveAttribute("href", "/roster");
    // The icon repeats the label.
    const svg = nav
      .getByRole("link", { name: "Events" })
      .element()
      .querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  test("has no other pages when none are given, or for other errors", async () => {
    const links = [{ label: "Events", href: "/events" }];
    const none = await renderIn("light", ErrorPage, notFound);
    expect(none.getByRole("navigation").elements()).toHaveLength(0);
    const other = await renderIn("light", ErrorPage, {
      ...serverError,
      links,
    });
    expect(other.getByRole("navigation").elements()).toHaveLength(0);
  });

  // The title in `foreground`, the explanation in `muted-foreground`, the
  // path in `foreground-soft` on `muted`. ErrorPage has no `dark:` code,
  // so these are tested in light.
  test("takes the roles' colours, its text readable", async () => {
    const links = [{ label: "Events", href: "/events" }];
    const screen = await renderIn("light", ErrorPage, { ...notFound, links });
    await expect
      .element(screen.getByRole("heading", { level: 1 }))
      .toHaveStyle({ color: role("foreground", "light") });

    const lead = screen.getByText(/couldn't find the page/).element();
    await expect
      .element(lead)
      .toHaveStyle({ color: role("muted-foreground", "light") });
    expectReadable(lead, "light");

    const path = screen.getByText("/evnts").element();
    await expect.element(path).toHaveStyle({
      color: role("foreground-soft", "light"),
      backgroundColor: role("muted", "light"),
    });
    expectReadable(path, "light");

    const other = screen.getByRole("link", { name: "Events" }).element();
    await expect
      .element(other)
      .toHaveStyle({ color: role("foreground-soft", "light") });
    expectReadable(other, "light");
  });

  // IconTile's primary circle (as StatCard's tile); its looks are tested
  // in IconTile.
  test("puts its icon on a primary circle, hidden from screen readers", async () => {
    const screen = await renderIn("light", ErrorPage, notFound);
    const circle = screen
      .getByRole("heading", { level: 1 })
      .element()
      .parentElement!.querySelector<HTMLElement>("[aria-hidden='true']")!;
    expect(circle.querySelector("svg")).not.toBeNull();
    await expect.element(circle).toHaveStyle({
      backgroundColor: translucent(role("primary", "light"), 15),
    });
  });

  // The status is clipped to a `foreground` → `muted-foreground` gradient;
  // both are text roles, readable on the page (the lead's test checks
  // `muted-foreground`). The h1 says what the number means.
  test("draws the status in a gradient of the text roles", async () => {
    const screen = await renderIn("light", ErrorPage, notFound);
    const status = screen.getByText("404", { exact: true }).element();
    const style = getComputedStyle(status);
    expect(style.backgroundClip).toBe("text");
    expect(style.color).toBe("rgba(0, 0, 0, 0)"); // transparent: the gradient shows
    expect(style.backgroundImage).toContain(role("foreground", "light"));
    expect(style.backgroundImage).toContain(role("muted-foreground", "light"));
  });

  test("takes a caller's class and attributes on its box", async () => {
    const screen = await renderIn("light", ErrorPage, {
      ...notFound,
      id: "error",
      class: "mt-6",
    });
    const box = screen
      .getByRole("heading", { level: 1 })
      .element().parentElement!;
    expect(box.id).toBe("error");
    expect(getComputedStyle(box).marginTop).toBe("24px");
  });

  // The server can't know the tab's history, and the button needs
  // JavaScript: it comes once the page has loaded. The time limit is long
  // because the first server render compiles the component.
  test("has no “Go back” on the server, only “Return home”", async () => {
    const html = await commands.serverRender(
      "/src/lib/ErrorPage/ErrorPage.svelte",
      serverError,
    );
    expect(html).toContain("Return home");
    expect(html).not.toContain("Go back");
  }, 60_000);
});
