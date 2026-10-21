import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
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

  // The guide's roles: `muted` fill, `input` border, `foreground` text.
  test.each(SCHEMES)("takes the input roles in %s", async (scheme) => {
    const screen = await renderIn(scheme, Select, {
      "aria-label": "Rating",
      children: options,
    });
    await expect.element(screen.getByRole("combobox")).toHaveStyle({
      backgroundColor: role("muted", scheme),
      borderColor: role("input", scheme),
      color: role("foreground", scheme),
    });
  });

  // The guide's `destructive` role.
  test.each(SCHEMES)(
    "has a destructive border when invalid in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Select, {
        "aria-label": "Rating",
        "aria-invalid": true,
        children: options,
      });
      await expect
        .element(screen.getByRole("combobox"))
        .toHaveStyle({ borderColor: role("destructive", scheme) });
    },
  );

  // The guide's `ring` role.
  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const colour = role("ring", scheme);
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
