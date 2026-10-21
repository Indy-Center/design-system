import { createRawSnippet } from "svelte";
import { page } from "vitest/browser";
import { afterEach, describe, expect, test } from "vitest";
import { expectReadable } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import PageHeader from "./PageHeader.svelte";

const events = {
  title: "Events",
  children: text("Upcoming events, with positions to sign up for."),
};

const actions = createRawSnippet(() => ({
  render: () => `<a href="/events/new">New event</a>`,
}));

describe("PageHeader", () => {
  // The runner's own size, as other tests expect it.
  afterEach(() => page.viewport(414, 896));

  test("has the page's h1", async () => {
    const screen = await renderIn("light", PageHeader, events);
    await expect
      .element(screen.getByRole("heading", { name: "Events", level: 1 }))
      .toBeInTheDocument();
  });

  // Not a <header>: in the body that would be a second banner landmark.
  test("adds no landmark", async () => {
    const screen = await renderIn("light", PageHeader, events);
    expect(screen.container.querySelector("header, [role]")).toBeNull();
  });

  // Chosen in ticket 10: the title in Heading's look 1 (3xl); the lead in
  // Text's lead look (lg, `foreground-soft`). Those looks are tested in
  // Heading and Text.
  test("has a 3xl title and an lg lead", async () => {
    const screen = await renderIn("light", PageHeader, events);
    await expect.element(screen.getByRole("heading")).toHaveStyle({
      fontSize: "30px",
      color: role("foreground", "light"),
    });
    const lead = screen.getByRole("paragraph");
    await expect
      .element(lead)
      .toHaveTextContent("Upcoming events, with positions to sign up for.");
    await expect.element(lead).toHaveStyle({
      fontSize: "18px",
      color: role("foreground-soft", "light"),
    });
    expectReadable(lead.element(), "light");
  });

  test("leaves the lead out when it has none", async () => {
    const screen = await renderIn("light", PageHeader, { title: "Roster" });
    await expect.element(screen.getByRole("paragraph")).not.toBeInTheDocument();
  });

  test("puts actions beside the title on a wide screen", async () => {
    await page.viewport(1280, 800);
    const screen = await renderIn("light", PageHeader, { ...events, actions });
    const link = screen.getByRole("link", { name: "New event" }).element();
    const heading = screen.getByRole("heading").element();
    expect(link.getBoundingClientRect().left).toBeGreaterThan(
      heading.getBoundingClientRect().right,
    );
  });

  test("stacks actions under the title on a phone", async () => {
    await page.viewport(390, 844);
    const screen = await renderIn("light", PageHeader, { ...events, actions });
    const link = screen.getByRole("link", { name: "New event" }).element();
    const lead = screen
      .getByText("Upcoming events, with positions to sign up for.")
      .element();
    expect(link.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      lead.getBoundingClientRect().bottom,
    );
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", PageHeader, {
      ...events,
      id: "top",
      class: "mb-8",
    });
    const root = screen
      .getByRole("heading")
      .element()
      .closest<HTMLElement>("main > *")!;
    await expect.element(root).toHaveAttribute("id", "top");
    await expect.element(root).toHaveStyle({ marginBottom: "32px" });
  });
});
