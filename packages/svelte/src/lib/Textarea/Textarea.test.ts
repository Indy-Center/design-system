import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
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

  // The guide's roles: `muted` fill, `input` border, `foreground` text.
  test.each(SCHEMES)("takes the input roles in %s", async (scheme) => {
    const screen = await renderIn(scheme, Textarea, {
      "aria-label": "Comments",
    });
    await expect.element(screen.getByRole("textbox")).toHaveStyle({
      backgroundColor: role("muted", scheme),
      borderColor: role("input", scheme),
      color: role("foreground", scheme),
    });
  });

  // The guide's `placeholder` role.
  test.each(SCHEMES)("colours its placeholder in %s", async (scheme) => {
    const screen = await renderIn(scheme, Textarea, {
      "aria-label": "Comments",
      placeholder: "What went well?",
    });
    const box = screen.getByRole("textbox").element();
    expect(getComputedStyle(box, "::placeholder").color).toBe(
      role("placeholder", scheme),
    );
  });

  // The guide's `destructive` role.
  test.each(SCHEMES)(
    "has a destructive border when invalid in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Textarea, {
        "aria-label": "Comments",
        "aria-invalid": true,
      });
      await expect
        .element(screen.getByRole("textbox"))
        .toHaveStyle({ borderColor: role("destructive", scheme) });
    },
  );

  // The guide's `ring` role.
  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const colour = role("ring", scheme);
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
