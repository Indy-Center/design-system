import { createRawSnippet, type ComponentProps } from "svelte";
import { describe, expect, test } from "vitest";
import { expectReadable } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { expectLeadingHiddenIcon, icon, text } from "../../../test/snippets.ts";
import EmptyState from "./EmptyState.svelte";

const noEvents = {
  title: "No events scheduled",
  level: 2 as const,
  children: text("New events show here once staff publish them."),
};

const addPositions = createRawSnippet(() => ({
  render: () => `<button type="button">Add positions</button>`,
}));

describe("EmptyState, large", () => {
  test("titles itself with a heading at its level", async () => {
    const screen = await renderIn("light", EmptyState, {
      ...noEvents,
      level: 4,
    });
    await expect
      .element(screen.getByRole("heading", { level: 4 }))
      .toHaveTextContent("No events scheduled");
  });

  // Heading's look 3 at any level: the level is the outline's, not a size.
  test("keeps the title at text-lg whatever its level", async () => {
    for (const level of [2, 5] as const) {
      const screen = await renderIn("light", EmptyState, {
        ...noEvents,
        level,
      });
      await expect
        .element(screen.getByRole("heading", { level }))
        .toHaveStyle({ fontSize: "18px" });
    }
  });

  test("puts the text under the title, then the action, named by its own text", async () => {
    const screen = await renderIn("light", EmptyState, {
      ...noEvents,
      action: addPositions,
    });
    const heading = screen.getByRole("heading").element();
    const line = screen
      .getByText("New events show here once staff publish them.")
      .element();
    const button = screen.getByRole("button", { name: "Add positions" });
    await expect.element(button).toBeVisible();
    expect(
      heading.compareDocumentPosition(line) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      line.compareDocumentPosition(button.element()) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  // IconTile's muted circle; its looks are tested in IconTile.
  test("puts an icon on a muted circle above the title, hidden from screen readers", async () => {
    const screen = await renderIn("light", EmptyState, { ...noEvents, icon });
    const svg = screen.getByTestId("icon").element();
    const box = screen.getByRole("heading").element().parentElement!;
    expectLeadingHiddenIcon(box, svg);
    await expect
      .element(svg.parentElement!)
      .toHaveStyle({ backgroundColor: role("muted", "light") });
  });

  test("has only its title and text without icon or action", async () => {
    const screen = await renderIn("light", EmptyState, {
      title: "Nothing to review",
      level: 3,
      children: text("Sessions waiting for review show here."),
    });
    const box = screen.getByRole("heading").element().parentElement!;
    expect(box.children).toHaveLength(2);
  });

  // It always says why it is empty or what to do: `npm run check` fails
  // if a title alone stops being a type error.
  test("needs its text: a title alone doesn't type-check", () => {
    // @ts-expect-error: a large EmptyState requires `children`.
    const titleOnly: ComponentProps<typeof EmptyState> = {
      title: "Nothing to review",
      level: 3,
    };
    expect(titleOnly.children).toBeUndefined();
  });

  // `foreground` for the title, `muted-foreground` for the text. No
  // surface of its own: it takes the page's or the panel's.
  test("takes the roles' colours, its text readable", async () => {
    const screen = await renderIn("light", EmptyState, noEvents);
    const heading = screen.getByRole("heading");
    await expect
      .element(heading)
      .toHaveStyle({ color: role("foreground", "light") });
    // No fill of its own: the surface under it shows through.
    await expect
      .element(heading.element().parentElement!)
      .toHaveStyle({ backgroundColor: "rgba(0, 0, 0, 0)" });
    const line = screen
      .getByText("New events show here once staff publish them.")
      .element();
    await expect
      .element(line)
      .toHaveStyle({ color: role("muted-foreground", "light") });
    expectReadable(line, "light");
  });

  test("takes a caller's class and attributes on its box", async () => {
    const screen = await renderIn("light", EmptyState, {
      ...noEvents,
      id: "no-events",
      class: "mt-6",
    });
    const box = screen.getByRole("heading").element().parentElement!;
    await expect.element(box).toHaveAttribute("id", "no-events");
    await expect.element(box).toHaveStyle({ marginTop: "24px" });
  });
});

describe("EmptyState, inline", () => {
  test("is one paragraph, with no heading", async () => {
    const screen = await renderIn("light", EmptyState, {
      size: "inline",
      children: text("No sessions yet."),
    });
    await expect
      .element(screen.getByRole("paragraph"))
      .toHaveTextContent("No sessions yet.");
    await expect.element(screen.getByRole("heading")).not.toBeInTheDocument();
  });

  // `text-sm` in `muted-foreground`, as training's one-line empty panels.
  test("is small and muted, and readable", async () => {
    const screen = await renderIn("light", EmptyState, {
      size: "inline",
      children: text("No sessions yet."),
    });
    const line = screen.getByRole("paragraph");
    await expect.element(line).toHaveStyle({
      fontSize: "14px",
      color: role("muted-foreground", "light"),
    });
    expectReadable(line.element(), "light");
  });

  test("takes a caller's class and attributes on its paragraph", async () => {
    const screen = await renderIn("light", EmptyState, {
      size: "inline",
      children: text("No sessions yet."),
      id: "no-sessions",
      class: "px-4",
    });
    const line = screen.getByRole("paragraph");
    await expect.element(line).toHaveAttribute("id", "no-sessions");
    await expect.element(line).toHaveStyle({ paddingLeft: "16px" });
  });
});
