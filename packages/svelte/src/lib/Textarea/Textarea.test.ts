import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Textarea from "./Textarea.svelte";

describe("Textarea", () => {
  test("is a text box named by its own label when used alone", async () => {
    const screen = await renderIn("light", Textarea, {
      "aria-label": "Comments",
    });
    await expect
      .element(screen.getByRole("textbox", { name: "Comments" }))
      .toBeInTheDocument();
  });

  test("binds its value both ways, over several lines", async () => {
    const screen = await renderIn("light", Textarea, {
      "aria-label": "Comments",
      value: "Good session",
    });
    const box = screen.getByRole("textbox");
    await expect.element(box).toHaveValue("Good session");
    await box.fill("Great session\nThanks");
    await expect.element(box).toHaveValue("Great session\nThanks");
  });

  // textControlClasses, whose looks formControl's tests hold.
  test("takes the input roles", async () => {
    const screen = await renderIn("light", Textarea, {
      "aria-label": "Comments",
    });
    await expect.element(screen.getByRole("textbox")).toHaveStyle({
      backgroundColor: role("muted", "light"),
      borderColor: role("input", "light"),
      color: role("foreground", "light"),
    });
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
