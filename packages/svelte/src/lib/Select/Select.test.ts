import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import Select from "./Select.svelte";

const options = createRawSnippet(() => ({
  render: () =>
    `<optgroup label="Ratings"><option value="S1">S1</option><option value="S2">S2</option><option value="S3">S3</option></optgroup>`,
}));

describe("Select", () => {
  test("is a list box named by its own label when used alone", async () => {
    const screen = await renderIn("light", Select, {
      "aria-label": "Rating",
      children: options,
    });
    await expect
      .element(screen.getByRole("combobox", { name: "Rating" }))
      .toBeInTheDocument();
    expect(screen.getByRole("option").elements()).toHaveLength(3);
  });

  test("binds its value both ways", async () => {
    const screen = await renderIn("light", Select, {
      "aria-label": "Rating",
      value: "S2",
      children: options,
    });
    const select = screen.getByRole("combobox");
    await expect.element(select).toHaveValue("S2");
    await select.selectOptions("S3");
    await expect.element(select).toHaveValue("S3");
  });

  // textControlClasses, whose looks formControl's tests hold.
  test("takes the input roles", async () => {
    const screen = await renderIn("light", Select, {
      "aria-label": "Rating",
      children: options,
    });
    await expect.element(screen.getByRole("combobox")).toHaveStyle({
      backgroundColor: role("muted", "light"),
      borderColor: role("input", "light"),
      color: role("foreground", "light"),
    });
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Select, {
      "aria-label": "Rating",
      name: "rating",
      class: "mt-4",
      children: options,
    });
    const select = screen.getByRole("combobox");
    await expect.element(select).toHaveAttribute("name", "rating");
    await expect.element(select).toHaveStyle({ marginTop: "16px" });
  });
});
