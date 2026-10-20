import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Input from "./Input.svelte";

describe("Input", () => {
  test("is a text box named by its own label when used alone", async () => {
    const screen = await renderIn("light", Input, {
      "aria-label": "Search the roster",
      type: "search",
    });
    const box = screen.getByRole("searchbox", { name: "Search the roster" });
    await expect.element(box).toHaveAttribute("type", "search");
  });

  test("passes each type the apps use to the input", async () => {
    for (const type of [
      "text",
      "url",
      "number",
      "date",
      "time",
      "datetime-local",
    ] as const) {
      const screen = await renderIn("light", Input, {
        "aria-label": type,
        type,
      });
      await expect
        .element(screen.container.querySelector("input")!)
        .toHaveAttribute("type", type);
    }
  });

  test("binds its value both ways", async () => {
    const screen = await renderIn("light", Input, {
      "aria-label": "Callsign",
      value: "IND_CTR",
    });
    const box = screen.getByRole("textbox", { name: "Callsign" });
    await expect.element(box).toHaveValue("IND_CTR");
    await box.fill("IND_APP");
    await expect.element(box).toHaveValue("IND_APP");
  });

  // The guide's roles: `muted` fill (#E2E8F0 light, #334155 dark), `input`
  // border (#64748B), `foreground` text (#0F172A light, #FFFFFF dark).
  test.each([
    ["light", "rgb(226, 232, 240)", "rgb(15, 23, 42)"],
    ["dark", "rgb(51, 65, 85)", "rgb(255, 255, 255)"],
    ["dark-header", "rgb(51, 65, 85)", "rgb(255, 255, 255)"],
  ] as const)("takes the input roles in %s", async (scheme, fill, text) => {
    const screen = await renderIn(scheme, Input, { "aria-label": "Name" });
    await expect.element(screen.getByRole("textbox")).toHaveStyle({
      backgroundColor: fill,
      borderColor: "rgb(100, 116, 139)",
      borderStyle: "solid",
      color: text,
    });
  });

  // The guide's `placeholder` role: #475569 light, #D1D5DB dark.
  test.each([
    ["light", "rgb(71, 85, 105)"],
    ["dark", "rgb(209, 213, 219)"],
    ["dark-header", "rgb(209, 213, 219)"],
  ] as const)("colours its placeholder in %s", async (scheme, colour) => {
    const screen = await renderIn(scheme, Input, {
      "aria-label": "Name",
      placeholder: "Jane Doe",
    });
    const box = screen.getByRole("textbox").element();
    expect(getComputedStyle(box, "::placeholder").color).toBe(colour);
  });

  // The guide's `destructive` role: #B91C1C light, #F87171 dark.
  test.each([
    ["light", "rgb(185, 28, 28)"],
    ["dark", "rgb(248, 113, 113)"],
    ["dark-header", "rgb(248, 113, 113)"],
  ] as const)(
    "has a destructive border when invalid in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Input, {
        "aria-label": "Name",
        "aria-invalid": true,
      });
      await expect
        .element(screen.getByRole("textbox"))
        .toHaveStyle({ borderColor: colour });
    },
  );

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Input, { "aria-label": "Name" });
      await userEvent.tab();
      const box = screen.getByRole("textbox");
      await expect.element(box).toHaveFocus();
      await expect.element(box).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );

  test("is at least 44px tall", async () => {
    const screen = await renderIn("light", Input, { "aria-label": "Name" });
    const box = screen.getByRole("textbox").element();
    expect(box.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Input, {
      "aria-label": "Name",
      name: "name",
      class: "mt-4",
    });
    const box = screen.getByRole("textbox");
    await expect.element(box).toHaveAttribute("name", "name");
    await expect.element(box).toHaveStyle({
      marginTop: "16px",
      borderColor: "rgb(100, 116, 139)",
    });
  });
});
