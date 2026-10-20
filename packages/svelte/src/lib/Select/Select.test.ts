import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
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

  // The guide's roles: `muted` fill (#E2E8F0 light, #334155 dark), `input`
  // border (#64748B), `foreground` text (#0F172A light, #FFFFFF dark).
  test.each([
    ["light", "rgb(226, 232, 240)", "rgb(15, 23, 42)"],
    ["dark", "rgb(51, 65, 85)", "rgb(255, 255, 255)"],
    ["dark-header", "rgb(51, 65, 85)", "rgb(255, 255, 255)"],
  ] as const)("takes the input roles in %s", async (scheme, fill, text) => {
    const screen = await renderIn(scheme, Select, {
      "aria-label": "Rating",
      children: options,
    });
    await expect.element(screen.getByRole("combobox")).toHaveStyle({
      backgroundColor: fill,
      borderColor: "rgb(100, 116, 139)",
      color: text,
    });
  });

  // The guide's `destructive` role: #B91C1C light, #F87171 dark.
  test.each([
    ["light", "rgb(185, 28, 28)"],
    ["dark", "rgb(248, 113, 113)"],
  ] as const)(
    "has a destructive border when invalid in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Select, {
        "aria-label": "Rating",
        "aria-invalid": true,
        children: options,
      });
      await expect
        .element(screen.getByRole("combobox"))
        .toHaveStyle({ borderColor: colour });
    },
  );

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Select, {
        "aria-label": "Rating",
        children: options,
      });
      await userEvent.tab();
      const select = screen.getByRole("combobox");
      await expect.element(select).toHaveFocus();
      await expect.element(select).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );

  test("changes its choice with the arrow keys", async () => {
    const screen = await renderIn("light", Select, {
      "aria-label": "Rating",
      value: "S1",
      children: options,
    });
    await userEvent.tab();
    await userEvent.keyboard("{ArrowDown}");
    await expect.element(screen.getByRole("combobox")).toHaveValue("S2");
  });

  test("is at least 44px tall", async () => {
    const screen = await renderIn("light", Select, {
      "aria-label": "Rating",
      children: options,
    });
    const select = screen.getByRole("combobox").element();
    expect(select.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
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
