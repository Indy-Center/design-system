import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import {
  contrastOn,
  expectReadable,
  SURFACES,
} from "../../../test/contrast.ts";
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

  test("is reached by Tab, and Escape clears it with an input event", async () => {
    const inputs: string[] = [];
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      oninput: (event: Event) =>
        inputs.push((event.target as HTMLInputElement).value),
    });
    await userEvent.tab();
    const box = screen.getByRole("searchbox");
    await expect.element(box).toHaveFocus();
    await userEvent.keyboard("Archer");
    await userEvent.keyboard("{Escape}");
    await expect.element(box).toHaveValue("");
    await expect.element(box).toHaveFocus();
    expect(inputs.at(-1)).toBe("");
  });

  // The box clears itself rather than leaving it to the browser, so
  // Escape stops there while there is text, and goes on (to close a dialog
  // or menu around it) once the box is empty.
  test("keeps Escape to itself only while it has text", async () => {
    const reached: boolean[] = [];
    const listen = () => reached.push(true);
    document.addEventListener("keydown", listen);
    try {
      const screen = await renderIn("light", SearchInput, {
        label: "Search",
        value: "Archer",
      });
      await screen.getByRole("searchbox").click();
      await userEvent.keyboard("{Escape}");
      expect(reached).toHaveLength(0);
      await userEvent.keyboard("{Escape}");
      expect(reached).toHaveLength(1);
    } finally {
      document.removeEventListener("keydown", listen);
    }
  });

  test("leaves Escape alone when a caller's onkeydown prevents it", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      value: "Archer",
      onkeydown: (event: KeyboardEvent) => event.preventDefault(),
    });
    const box = screen.getByRole("searchbox");
    await box.click();
    await userEvent.keyboard("{Escape}");
    await expect.element(box).toHaveValue("Archer");
  });

  test("shows a 44px clear button once there is text, which clears and refocuses the box with an input event", async () => {
    const inputs: string[] = [];
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      oninput: (event: Event) =>
        inputs.push((event.target as HTMLInputElement).value),
    });
    const clear = screen.getByRole("button", { name: "Clear the search" });
    await expect.element(clear).not.toBeInTheDocument();
    const box = screen.getByRole("searchbox");
    await box.fill("Archer");
    const size = clear.element().getBoundingClientRect();
    expect(size.height).toBeGreaterThanOrEqual(44);
    expect(size.width).toBeGreaterThanOrEqual(44);
    await clear.click();
    await expect.element(box).toHaveValue("");
    await expect.element(box).toHaveFocus();
    await expect.element(clear).not.toBeInTheDocument();
    expect(inputs.at(-1)).toBe("");
  });

  // The `ring` role.
  test("its clear button shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      value: "Archer",
    });
    await userEvent.tab();
    await userEvent.tab();
    const clear = screen.getByRole("button", { name: "Clear the search" });
    await expect.element(clear).toHaveFocus();
    await expect.element(clear).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
    });
  });

  test.each([{ disabled: true }, { readonly: true }])(
    "has no clear button when %o",
    async (props) => {
      const screen = await renderIn("light", SearchInput, {
        label: "Search",
        value: "Archer",
        ...props,
      });
      await expect
        .element(screen.getByRole("button", { name: "Clear the search" }))
        .not.toBeInTheDocument();
    },
  );

  // Its own clear button stands in for the browser's, so there is one.
  // Chromium doesn't compute styles for that pseudo-element, so this finds
  // the rule that hides it on the box.
  test("hides the browser's own clear button", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      value: "Archer",
    });
    const box = screen.getByRole("searchbox").element();
    const pseudo = "::-webkit-search-cancel-button";
    // Tailwind's rules sit inside `@layer` blocks.
    const flatten = (rules: CSSRuleList): CSSRule[] =>
      [...rules].flatMap((rule) =>
        rule instanceof CSSGroupingRule ? flatten(rule.cssRules) : [rule],
      );
    const rules = [...document.styleSheets]
      .flatMap((sheet) => flatten(sheet.cssRules))
      .filter((rule) => rule instanceof CSSStyleRule)
      .filter(
        (rule) =>
          rule.selectorText.endsWith(pseudo) &&
          box.matches(rule.selectorText.slice(0, -pseudo.length)),
      );
    expect(rules.map((rule) => rule.style.appearance)).toContain("none");
  });

  // textControlClasses, whose looks formControl's tests hold.
  test("takes the input roles", async () => {
    const screen = await renderIn("light", SearchInput, { label: "Search" });
    await expect.element(screen.getByRole("searchbox")).toHaveStyle({
      backgroundColor: role("muted", "light"),
      borderColor: role("input", "light"),
      color: role("foreground", "light"),
    });
  });

  // The guide's `foreground-soft` for the label, as Field's, and
  // `muted-foreground` for the icons, 3:1 on the box's `muted` fill.
  test("colours its label and icons", async () => {
    const screen = await renderIn("light", SearchInput, {
      label: "Search",
      value: "Archer",
    });
    const label = screen.getByText("Search", { exact: true });
    await expect
      .element(label)
      .toHaveStyle({ color: role("foreground-soft", "light") });
    expectReadable(label.element(), "light");
    const { background, card } = SURFACES.light;
    for (const icon of screen.container.querySelectorAll("svg")) {
      await expect
        .element(icon)
        .toHaveStyle({ color: role("muted-foreground", "light") });
      for (const surface of [background, card]) {
        expect(
          contrastOn(icon, surface, role("muted", "light")),
        ).toBeGreaterThanOrEqual(3);
      }
    }
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
