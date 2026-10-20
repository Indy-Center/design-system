import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { renderIn } from "../../../test/schemes.ts";
import Text from "./Text.svelte";

const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

const sentence = "Sign up by Friday.";

describe("Text", () => {
  test("is a paragraph by default", async () => {
    const screen = await renderIn("light", Text, { children: text(sentence) });
    await expect
      .element(screen.getByRole("paragraph"))
      .toHaveTextContent(sentence);
  });

  test.each(["span", "div"] as const)("is a %s when asked", async (as) => {
    const screen = await renderIn("light", Text, {
      as,
      children: text(sentence),
    });
    const element = screen.getByText(sentence).element().parentElement;
    expect(element?.tagName).toBe(as.toUpperCase());
    expect(screen.container.querySelector("p")).toBeNull();
  });

  // Looks chosen in ticket 10, in the guide's roles: lead lg (18px) in
  // `foreground-soft` (#334155 light, #D1D5DB dark); muted base (16px) and
  // small sm (14px) in `muted-foreground` (#475569 light, #9CA3AF dark).
  const looks = {
    lead: { props: { lead: true }, fontSize: "18px" },
    muted: { props: { tone: "muted" }, fontSize: "16px" },
    small: { props: { size: "small" }, fontSize: "14px" },
  } as const;

  test.each([
    ["lead", "light", "rgb(51, 65, 85)"],
    ["lead", "dark", "rgb(209, 213, 219)"],
    ["lead", "dark-header", "rgb(209, 213, 219)"],
    ["muted", "light", "rgb(71, 85, 105)"],
    ["muted", "dark", "rgb(156, 163, 175)"],
    ["muted", "dark-header", "rgb(156, 163, 175)"],
    ["small", "light", "rgb(71, 85, 105)"],
    ["small", "dark", "rgb(156, 163, 175)"],
    ["small", "dark-header", "rgb(156, 163, 175)"],
  ] as const)("%s in %s is %s", async (look, scheme, colour) => {
    const screen = await renderIn(scheme, Text, {
      ...looks[look].props,
      children: text(sentence),
    });
    await expect.element(screen.getByRole("paragraph")).toHaveStyle({
      color: colour,
      fontSize: looks[look].fontSize,
    });
  });

  // Plain body text is `base.css`'s job: Text adds nothing, so it follows
  // whatever it sits in.
  test("without a look, takes its parent's colour and size", async () => {
    const screen = await renderIn("dark", Text, { children: text(sentence) });
    screen.container.style.color = "rgb(1, 2, 3)";
    screen.container.style.fontSize = "13px";
    await expect
      .element(screen.getByRole("paragraph"))
      .toHaveStyle({ color: "rgb(1, 2, 3)", fontSize: "13px" });
  });

  // Each look sets its own size, whatever it sits in.
  test.each([
    ["lead", { lead: true }, "18px"],
    ["muted", { tone: "muted" }, "16px"],
    ["small", { size: "small" }, "14px"],
    ["small and muted", { size: "small", tone: "muted" }, "14px"],
  ] as const)(
    "%s keeps its size inside larger text",
    async (_, props, fontSize) => {
      const screen = await renderIn("light", Text, {
        ...props,
        children: text(sentence),
      });
      screen.container.style.fontSize = "24px";
      await expect
        .element(screen.getByRole("paragraph"))
        .toHaveStyle({ fontSize });
    },
  );

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Text, {
      size: "small",
      id: "hint",
      class: "mt-2",
      children: text(sentence),
    });
    const paragraph = screen.getByRole("paragraph");
    await expect.element(paragraph).toHaveAttribute("id", "hint");
    await expect
      .element(paragraph)
      .toHaveStyle({ marginTop: "8px", fontSize: "14px" });
  });
});
