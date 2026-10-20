import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Textarea from "./Textarea.svelte";

describe("Textarea", () => {
  test("is a multi-line text box named by its own label when used alone", async () => {
    const screen = await renderIn("light", Textarea, {
      "aria-label": "Comments",
    });
    const box = screen.getByRole("textbox", { name: "Comments" });
    await expect.element(box).toHaveProperty("tagName", "TEXTAREA");
  });

  test("binds its value both ways", async () => {
    const screen = await renderIn("light", Textarea, {
      "aria-label": "Comments",
      value: "Good session",
    });
    const box = screen.getByRole("textbox");
    await expect.element(box).toHaveValue("Good session");
    await box.fill("Great session");
    await expect.element(box).toHaveValue("Great session");
  });

  // The guide's roles: `muted` fill (#E2E8F0 light, #334155 dark), `input`
  // border (#64748B), `foreground` text (#0F172A light, #FFFFFF dark).
  test.each([
    ["light", "rgb(226, 232, 240)", "rgb(15, 23, 42)"],
    ["dark", "rgb(51, 65, 85)", "rgb(255, 255, 255)"],
    ["dark-header", "rgb(51, 65, 85)", "rgb(255, 255, 255)"],
  ] as const)("takes the input roles in %s", async (scheme, fill, text) => {
    const screen = await renderIn(scheme, Textarea, {
      "aria-label": "Comments",
    });
    await expect.element(screen.getByRole("textbox")).toHaveStyle({
      backgroundColor: fill,
      borderColor: "rgb(100, 116, 139)",
      color: text,
    });
  });

  // The guide's `placeholder` role: #475569 light, #D1D5DB dark.
  test.each([
    ["light", "rgb(71, 85, 105)"],
    ["dark", "rgb(209, 213, 219)"],
    ["dark-header", "rgb(209, 213, 219)"],
  ] as const)("colours its placeholder in %s", async (scheme, colour) => {
    const screen = await renderIn(scheme, Textarea, {
      "aria-label": "Comments",
      placeholder: "What went well?",
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
      const screen = await renderIn(scheme, Textarea, {
        "aria-label": "Comments",
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
      const screen = await renderIn(scheme, Textarea, {
        "aria-label": "Comments",
      });
      await userEvent.tab();
      const box = screen.getByRole("textbox");
      await expect.element(box).toHaveFocus();
      await expect.element(box).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );

  test("is at least 44px tall with one row", async () => {
    const screen = await renderIn("light", Textarea, {
      "aria-label": "Comments",
      rows: 1,
    });
    const box = screen.getByRole("textbox").element();
    expect(box.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Textarea, {
      "aria-label": "Comments",
      rows: 6,
      class: "mt-4",
    });
    const box = screen.getByRole("textbox");
    await expect.element(box).toHaveAttribute("rows", "6");
    await expect.element(box).toHaveStyle({ marginTop: "16px" });
  });
});
