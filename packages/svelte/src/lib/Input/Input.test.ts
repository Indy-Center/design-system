import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
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

  test("passes each type the apps use to the input", async () => {
    for (const type of [
      "text",
      "url",
      "number",
      "date",
      "time",
      "datetime-local",
    ] as const) {
      const screen = await renderIn("light", Input, {
        "aria-label": type,
        type,
      });
      await expect
        .element(screen.container.querySelector("input")!)
        .toHaveAttribute("type", type);
    }
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

  // The guide's roles: `muted` fill, `input` border, `foreground` text.
  test.each(SCHEMES)("takes the input roles in %s", async (scheme) => {
    const screen = await renderIn(scheme, Input, { "aria-label": "Name" });
    await expect.element(screen.getByRole("textbox")).toHaveStyle({
      backgroundColor: role("muted", scheme),
      borderColor: role("input", scheme),
      borderStyle: "solid",
      color: role("foreground", scheme),
    });
  });

  // The guide's `placeholder` role.
  test.each(SCHEMES)("colours its placeholder in %s", async (scheme) => {
    const screen = await renderIn(scheme, Input, {
      "aria-label": "Name",
      placeholder: "Jane Doe",
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
      const screen = await renderIn(scheme, Input, {
        "aria-label": "Name",
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
      const screen = await renderIn(scheme, Input, { "aria-label": "Name" });
      await userEvent.tab();
      const box = screen.getByRole("textbox");
      await expect.element(box).toHaveFocus();
      await expect.element(box).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    },
  );

  test("is at least 44px tall", async () => {
    const screen = await renderIn("light", Input, { "aria-label": "Name" });
    const box = screen.getByRole("textbox").element();
    expect(box.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
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
