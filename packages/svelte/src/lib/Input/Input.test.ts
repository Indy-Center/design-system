import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
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

  test.each([
    [undefined, "text"],
    ["datetime-local", "datetime-local"],
  ] as const)("given type %s, is a %s input", async (type, rendered) => {
    const screen = await renderIn("light", Input, {
      "aria-label": "When",
      type,
    });
    await expect
      .element(screen.getByLabelText("When"))
      .toHaveAttribute("type", rendered);
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

  // textControlClasses, whose looks formControl's tests hold.
  test("takes the input roles", async () => {
    const screen = await renderIn("light", Input, { "aria-label": "Name" });
    await expect.element(screen.getByRole("textbox")).toHaveStyle({
      backgroundColor: role("muted", "light"),
      borderColor: role("input", "light"),
      color: role("foreground", "light"),
    });
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
      borderColor: role("input", "light"),
    });
  });
});
