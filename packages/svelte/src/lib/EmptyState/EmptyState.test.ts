import { createRawSnippet, type ComponentProps } from "svelte";
import { describe, expect, test } from "vitest";
import { SCHEMES, expectReadable } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { icon, text } from "../../../test/snippets.ts";
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
  test.each([2, 3, 4] as const)(
    "titles itself with a heading at level %i",
    async (level) => {
      const screen = await renderIn("light", EmptyState, {
        ...noEvents,
        level,
      });
      await expect
        .element(screen.getByRole("heading", { level }))
        .toHaveTextContent("No events scheduled");
    },
  );

  // Heading's look 3 at any level: the level is the outline's, not a size.
  test("keeps the title at text-lg whatever its level", async () => {
    for (const level of [2, 5] as const) {
      const screen = await renderIn("light", EmptyState, {
        ...noEvents,
        level,
      });
      await expect
        .element(screen.getByRole("heading", { level }))
        .toHaveStyle({ fontSize: "18px", fontWeight: "600" });
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

  test("puts an icon above the title, hidden from screen readers", async () => {
    const screen = await renderIn("light", EmptyState, { ...noEvents, icon });
    const circle = screen.getByTestId("icon").element().parentElement!;
    expect(circle.getAttribute("aria-hidden")).toBe("true");
    expect(circle.nextElementSibling!.tagName).toBe("H2");
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

  // `foreground` for the title, `muted-foreground` for the text and the
  // icon, the icon on a `muted` circle. No surface of its own: it takes the
  // page's or the panel's.
  test.each(SCHEMES)(
    "takes the roles' colours in %s, its text readable",
    async (scheme) => {
      const screen = await renderIn(scheme, EmptyState, {
        ...noEvents,
        icon,
      });
      const heading = screen.getByRole("heading");
      await expect
        .element(heading)
        .toHaveStyle({ color: role("foreground", scheme) });
      const box = heading.element().parentElement!;
      // No fill of its own: the surface under it shows through.
      expect(getComputedStyle(box).backgroundColor).toBe("rgba(0, 0, 0, 0)");
      const line = screen
        .getByText("New events show here once staff publish them.")
        .element();
      expect(getComputedStyle(line).color).toBe(
        role("muted-foreground", scheme),
      );
      expectReadable(line, scheme);
      const circle = screen.getByTestId("icon").element().parentElement!;
      expect(getComputedStyle(circle)).toMatchObject({
        backgroundColor: role("muted", scheme),
        color: role("muted-foreground", scheme),
      });
    },
  );

  test("takes a caller's class and attributes on its box", async () => {
    const screen = await renderIn("light", EmptyState, {
      ...noEvents,
      id: "no-events",
      class: "mt-6",
    });
    const box = screen.getByRole("heading").element().parentElement!;
    expect(box.id).toBe("no-events");
    expect(getComputedStyle(box).marginTop).toBe("24px");
  });
});

describe("EmptyState, inline", () => {
  test("is one paragraph, with no heading", async () => {
    const screen = await renderIn("light", EmptyState, {
      size: "inline",
      children: text("No sessions yet."),
    });
    const line = screen.getByText("No sessions yet.").element();
    expect(line.parentElement!.tagName).toBe("P");
    expect(screen.getByRole("heading").elements()).toHaveLength(0);
  });

  // `text-sm` in `muted-foreground`, as training's one-line empty panels.
  test.each(SCHEMES)(
    "is small and muted in %s, and readable",
    async (scheme) => {
      const screen = await renderIn(scheme, EmptyState, {
        size: "inline",
        children: text("No sessions yet."),
      });
      const line = screen
        .getByText("No sessions yet.")
        .element().parentElement!;
      expect(getComputedStyle(line)).toMatchObject({
        fontSize: "14px",
        color: role("muted-foreground", scheme),
      });
      expectReadable(line, scheme);
    },
  );

  test("takes a caller's class and attributes on its paragraph", async () => {
    const screen = await renderIn("light", EmptyState, {
      size: "inline",
      children: text("No sessions yet."),
      id: "no-sessions",
      class: "px-4",
    });
    const line = screen.getByText("No sessions yet.").element().parentElement!;
    expect(line.id).toBe("no-sessions");
    expect(getComputedStyle(line).paddingLeft).toBe("16px");
  });
});
