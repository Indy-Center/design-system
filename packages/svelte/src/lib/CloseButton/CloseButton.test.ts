import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import CloseButton from "./CloseButton.svelte";

describe("CloseButton", () => {
  test("is a button named as the caller says, with the caller's class and attributes", async () => {
    let clicks = 0;
    const screen = await renderIn("light", CloseButton, {
      "aria-label": "Dismiss Roster saved.",
      class: "ml-2",
      id: "close",
      onclick: () => clicks++,
    });
    const button = screen.getByRole("button", {
      name: "Dismiss Roster saved.",
    });
    await expect.element(button).toHaveAttribute("type", "button");
    await expect.element(button).toHaveAttribute("id", "close");
    await expect.element(button).toHaveClass("ml-2");
    await button.click();
    expect(clicks).toBe(1);
  });

  test("is a 44px target, drawn muted", async () => {
    const screen = await renderIn("light", CloseButton, {
      "aria-label": "Close",
    });
    const button = screen.getByRole("button", { name: "Close" });
    const box = button.element().getBoundingClientRect();
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await expect
      .element(button)
      .toHaveStyle({ color: role("muted-foreground", "light") });
  });

  test("shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", CloseButton, {
      "aria-label": "Close",
    });
    await userEvent.tab();
    const button = screen.getByRole("button", { name: "Close" });
    await expect.element(button).toHaveFocus();
    await expect.element(button).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });
});
