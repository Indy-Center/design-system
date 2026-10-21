import { createRawSnippet } from "svelte";
import { page } from "vitest/browser";
import { afterEach, describe, expect, test } from "vitest";
import { SCHEMES, expectReadable } from "../../../test/contrast.ts";
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
    const heading = screen.getByRole("heading", { name: "Events", level: 1 });
    await expect.element(heading).toBeInTheDocument();
    expect(heading.element().tagName).toBe("H1");
  });

  // Not a <header>: in the body that would be a second banner landmark.
  test("adds no landmark", async () => {
    const screen = await renderIn("light", PageHeader, events);
    expect(screen.container.querySelector("header, [role]")).toBeNull();
  });

  // Chosen in ticket 10: h1 3xl semibold in the heading font; the lead
  // through Text's lead look (lg, `foreground-soft`).
  test.each(SCHEMES)(
    "has a 3xl title and a readable lg lead in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, PageHeader, events);
      const heading = screen.getByRole("heading");
      await expect.element(heading).toHaveStyle({
        fontSize: "30px",
        fontWeight: "600",
        color: role("foreground", scheme),
      });
      expect(getComputedStyle(heading.element()).fontFamily).toMatch(
        /^"Source Sans 3"/,
      );
      const lead = screen
        .getByText("Upcoming events, with positions to sign up for.")
        .element().parentElement!;
      expect(lead.tagName).toBe("P");
      expect(getComputedStyle(lead)).toMatchObject({
        fontSize: "18px",
        color: role("foreground-soft", scheme),
      });
      expectReadable(lead, scheme);
    },
  );

  test("leaves the lead out when it has none", async () => {
    const screen = await renderIn("light", PageHeader, { title: "Roster" });
    expect(screen.container.querySelector("p")).toBeNull();
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

  // No rule under it (ticket 10).
  test("has no rule under it", async () => {
    const screen = await renderIn("light", PageHeader, { ...events, actions });
    const root = screen.getByRole("heading").element().closest("main > *")!;
    // Tailwind's base styles every border solid; a rule would need a width.
    expect(getComputedStyle(root).borderBottomWidth).toBe("0px");
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", PageHeader, {
      ...events,
      id: "top",
      class: "mb-8",
    });
    const root = screen.getByRole("heading").element().closest("main > *")!;
    expect(root.id).toBe("top");
    expect(getComputedStyle(root).marginBottom).toBe("32px");
  });
});
