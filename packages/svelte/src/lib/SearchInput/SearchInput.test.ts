import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import SearchInput from "./SearchInput.svelte";

describe("SearchInput", () => {
  test("is a search box named by its visible label", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search the roster",
    });
    const box = screen.getByRole("searchbox", { name: "Search the roster" });
    await expect.element(box).toHaveAttribute("type", "search");
    await expect.element(screen.getByText("Search the roster")).toBeVisible();
  });

  test("keeps its name when the label is visually hidden", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search the roster",
      hideLabel: true,
    });
    await expect
      .element(screen.getByRole("searchbox", { name: "Search the roster" }))
      .toBeVisible();
    const label = screen.getByText("Search the roster").element();
    expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });

  test("shows a search icon, hidden from screen readers, inside the box", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search the roster",
    });
    const box = screen.getByRole("searchbox").element();
    const svg = screen.container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    const icon = svg.getBoundingClientRect();
    const field = box.getBoundingClientRect();
    expect(icon.left).toBeGreaterThan(field.left);
    expect(icon.top).toBeGreaterThan(field.top);
    expect(icon.bottom).toBeLessThan(field.bottom);
    // The text starts after the icon, not under it.
    expect(parseFloat(getComputedStyle(box).paddingLeft)).toBeGreaterThan(
      icon.right - field.left,
    );
  });

  test("binds its value both ways", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      value: "Archer",
    });
    const box = screen.getByRole("searchbox");
    await expect.element(box).toHaveValue("Archer");
    await box.fill("1234567");
    await expect.element(box).toHaveValue("1234567");
  });

  test("is reached by Tab, and Escape clears it", async () => {
    const screen = await renderIn("light", SearchInput, { label: "Search" });
    await userEvent.tab();
    const box = screen.getByRole("searchbox");
    await expect.element(box).toHaveFocus();
    await userEvent.keyboard("Archer");
    await expect.element(box).toHaveValue("Archer");
    await userEvent.keyboard("{Escape}");
    await expect.element(box).toHaveValue("");
  });

  // The guide's roles: the input roles for the box, as Input has.
  test.each(SCHEMES)("takes the input roles in %s", async (scheme) => {
    const screen = await renderIn(scheme, SearchInput, { label: "Search" });
    await expect.element(screen.getByRole("searchbox")).toHaveStyle({
      backgroundColor: role("muted", scheme),
      borderColor: role("input", scheme),
      color: role("foreground", scheme),
    });
  });

  // The guide's `foreground-soft` for the label, as Field's, and
  // `muted-foreground` for the icon.
  test.each(SCHEMES)("colours its label and icon in %s", async (scheme) => {
    const screen = await renderIn(scheme, SearchInput, { label: "Search" });
    await expect
      .element(screen.getByText("Search"))
      .toHaveStyle({ color: role("foreground-soft", scheme) });
    await expect
      .element(screen.container.querySelector("svg")!)
      .toHaveStyle({ color: role("muted-foreground", scheme) });
  });

  // The guide's `ring` role.
  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, SearchInput, { label: "Search" });
      await userEvent.tab();
      await expect.element(screen.getByRole("searchbox")).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    },
  );

  test("is at least 44px tall", async () => {
    const screen = await renderIn("light", SearchInput, { label: "Search" });
    const box = screen.getByRole("searchbox").element();
    expect(box.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  test("puts a caller's class on its box and attributes on the input", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      name: "q",
      placeholder: "Name or CID",
      class: "mt-4",
    });
    const box = screen.getByRole("searchbox");
    await expect.element(box).toHaveAttribute("name", "q");
    await expect.element(box).toHaveAttribute("placeholder", "Name or CID");
    await expect.element(box).not.toHaveStyle({ marginTop: "16px" });
    expect(
      getComputedStyle(screen.container.firstElementChild!).marginTop,
    ).toBe("16px");
  });

  test("uses a caller's id for the box, so the label still names it", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      id: "roster-search",
    });
    await expect
      .element(screen.getByRole("searchbox", { name: "Search" }))
      .toHaveAttribute("id", "roster-search");
  });
});
