import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import Text from "./Text.svelte";

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
  // `foreground-soft`; muted base (16px) and small sm (14px) in
  // `muted-foreground`.
  const looks = {
    lead: { props: { lead: true }, fontSize: "18px" },
    muted: { props: { tone: "muted" }, fontSize: "16px" },
    small: { props: { size: "small" }, fontSize: "14px" },
  } as const;

  test.each([
    ["lead", "light", "foreground-soft"],
    ["lead", "dark", "foreground-soft"],
    ["lead", "dark-header", "foreground-soft"],
    ["muted", "light", "muted-foreground"],
    ["muted", "dark", "muted-foreground"],
    ["muted", "dark-header", "muted-foreground"],
    ["small", "light", "muted-foreground"],
    ["small", "dark", "muted-foreground"],
    ["small", "dark-header", "muted-foreground"],
  ] as const)("%s in %s is %s", async (look, scheme, name) => {
    const screen = await renderIn(scheme, Text, {
      ...looks[look].props,
      children: text(sentence),
    });
    await expect.element(screen.getByRole("paragraph")).toHaveStyle({
      color: role(name, scheme),
      fontSize: looks[look].fontSize,
    });
  });

  // Plain body text is `base.css`'s job: Text adds nothing, so it follows
  // whatever it sits in.
  test("without a look, takes its parent's colour and size", async () => {
    const screen = await renderIn("dark", Text, { children: text(sentence) });
    // Any colour that isn't a role.
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
