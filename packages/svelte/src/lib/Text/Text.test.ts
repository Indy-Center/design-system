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
  test.each([
    ["lead", { lead: true }, "foreground-soft", "18px"],
    ["muted", { tone: "muted" }, "muted-foreground", "16px"],
    ["small", { size: "small" }, "muted-foreground", "14px"],
  ] as const)("%s is %s at %s", async (_, props, name, fontSize) => {
    const screen = await renderIn("light", Text, {
      ...props,
      children: text(sentence),
    });
    await expect.element(screen.getByRole("paragraph")).toHaveStyle({
      color: role(name, "light"),
      fontSize,
    });
  });

  // Plain body text is `base.css`'s job: Text adds nothing, so it follows
  // whatever it sits in.
  test("without a look, takes its parent's colour and size", async () => {
    const screen = await renderIn("light", Text, { children: text(sentence) });
    // Any colour that isn't a role.
    screen.container.style.color = "rgb(1, 2, 3)";
    screen.container.style.fontSize = "13px";
    await expect
      .element(screen.getByRole("paragraph"))
      .toHaveStyle({ color: "rgb(1, 2, 3)", fontSize: "13px" });
  });

  // A look sets its own size, whatever it sits in; small wins over muted.
  test("small and muted keeps the small size inside larger text", async () => {
    const screen = await renderIn("light", Text, {
      size: "small",
      tone: "muted",
      children: text(sentence),
    });
    screen.container.style.fontSize = "24px";
    await expect
      .element(screen.getByRole("paragraph"))
      .toHaveStyle({ fontSize: "14px" });
  });

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
