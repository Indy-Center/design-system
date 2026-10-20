import { createRawSnippet } from "svelte";
import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-svelte";
import { renderIn } from "../../../test/schemes.ts";
import Button from "./Button.svelte";

const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

describe("Button", () => {
  test('is a button named by its text, of type "button"', async () => {
    const screen = await renderIn("light", Button, { children: text("Save") });
    const button = screen.getByRole("button", { name: "Save" });
    await expect.element(button).toHaveAttribute("type", "button");
  });

  test("is a link when given an href", async () => {
    const screen = await renderIn("light", Button, {
      href: "/events/new",
      children: text("New event"),
    });
    const link = screen.getByRole("link", { name: "New event" });
    await expect.element(link).toHaveAttribute("href", "/events/new");
    await expect.element(link).not.toHaveAttribute("type");
    expect(screen.container.querySelector("button")).toBeNull();
  });

  // From the guide's Roles table. primary: `primary` #0369A1 under
  // `primary-foreground` #FFFFFF, in both schemes. secondary: no fill,
  // `input` #64748B edge, `foreground` text (#0F172A light, #FFFFFF dark).
  // danger: `destructive` (#B91C1C light, #F87171 dark) under `card`
  // (#FFFFFF light, #1E293B dark).
  const transparent = "rgba(0, 0, 0, 0)";
  test.each([
    ["primary", "light", "rgb(3, 105, 161)", "rgb(255, 255, 255)"],
    ["primary", "dark", "rgb(3, 105, 161)", "rgb(255, 255, 255)"],
    ["primary", "dark-header", "rgb(3, 105, 161)", "rgb(255, 255, 255)"],
    ["secondary", "light", transparent, "rgb(15, 23, 42)"],
    ["secondary", "dark", transparent, "rgb(255, 255, 255)"],
    ["secondary", "dark-header", transparent, "rgb(255, 255, 255)"],
    ["danger", "light", "rgb(185, 28, 28)", "rgb(255, 255, 255)"],
    ["danger", "dark", "rgb(248, 113, 113)", "rgb(30, 41, 59)"],
    ["danger", "dark-header", "rgb(248, 113, 113)", "rgb(30, 41, 59)"],
  ] as const)("%s in %s", async (variant, scheme, fill, ink) => {
    const screen = await renderIn(scheme, Button, {
      variant,
      children: text("Save"),
    });
    await expect
      .element(screen.getByRole("button"))
      .toHaveStyle({ backgroundColor: fill, color: ink });
  });

  test("secondary has an edge in the input colour", async () => {
    const screen = await renderIn("light", Button, {
      variant: "secondary",
      children: text("Cancel"),
    });
    await expect.element(screen.getByRole("button")).toHaveStyle({
      borderStyle: "solid",
      borderColor: "rgb(100, 116, 139)",
    });
  });

  // Tailwind's text-sm, text-base and text-lg; md matches Input's text.
  test.each([
    ["sm", "14px"],
    ["md", "16px"],
    ["lg", "18px"],
  ] as const)("%s is %s text", async (size, fontSize) => {
    const screen = await renderIn("light", Button, {
      size,
      children: text("Save"),
    });
    await expect.element(screen.getByRole("button")).toHaveStyle({ fontSize });
  });

  test("is md when no size is given", async () => {
    const screen = await renderIn("light", Button, { children: text("Save") });
    await expect
      .element(screen.getByRole("button"))
      .toHaveStyle({ fontSize: "16px" });
  });

  // WCAG 2.5.8 and the conventions: every control at least 44px each way.
  test.each(["sm", "md", "lg"] as const)(
    "%s is at least 44px tall and wide, even holding one letter",
    async (size) => {
      const screen = await renderIn("light", Button, {
        size,
        children: text("+"),
      });
      const box = screen.getByRole("button").element().getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    },
  );

  describe("busy", () => {
    test('says "Working" through a status, and is marked busy', async () => {
      const screen = await renderIn("light", Button, {
        busy: true,
        children: text("Save"),
      });
      const button = screen.getByRole("button");
      await expect.element(button).toHaveAttribute("aria-busy", "true");
      await expect
        .element(button.getByRole("status"))
        .toHaveTextContent("Working");
    });

    test("says the busy label it's given", async () => {
      const screen = await renderIn("light", Button, {
        busy: true,
        busyLabel: "Saving",
        children: text("Save"),
      });
      await expect
        .element(screen.getByRole("status"))
        .toHaveTextContent("Saving");
    });

    test("isn't busy, and has no status, until told", async () => {
      const screen = await renderIn("light", Button, {
        children: text("Save"),
      });
      await expect
        .element(screen.getByRole("button"))
        .not.toHaveAttribute("aria-busy");
      expect(screen.container.querySelector('[role="status"]')).toBeNull();
    });

    test("keeps its text and its focus", async () => {
      const screen = await renderIn("light", Button, {
        busy: true,
        children: text("Save"),
      });
      const button = screen.getByRole("button");
      await expect.element(button.getByText("Save")).toBeVisible();
      await expect.element(button).toBeEnabled();
      await userEvent.tab();
      await expect.element(button).toHaveFocus();
    });

    test("ignores clicks, Enter and Space", async () => {
      const onclick = vi.fn();
      const screen = await renderIn("light", Button, {
        busy: true,
        onclick,
        children: text("Save"),
      });
      await screen.getByRole("button").click();
      await userEvent.tab();
      await userEvent.keyboard("{Enter}");
      await userEvent.keyboard(" ");
      expect(onclick).not.toHaveBeenCalled();
    });

    test("doesn't submit its form", async () => {
      const form = document.createElement("form");
      const onsubmit = vi.fn((e: Event) => e.preventDefault());
      form.addEventListener("submit", onsubmit);
      document.body.append(form);
      try {
        const screen = await render(Button, {
          target: form,
          props: { busy: true, type: "submit", children: text("Save") },
        });
        await screen.getByRole("button").click();
        expect(onsubmit).not.toHaveBeenCalled();
      } finally {
        form.remove();
      }
    });

    test("as a link, doesn't follow its href", async () => {
      const followed = vi.fn();
      const watch = (e: Event) => {
        if (!e.defaultPrevented) followed();
        e.preventDefault(); // keep the test page where it is
      };
      document.addEventListener("click", watch);
      try {
        const screen = await renderIn("light", Button, {
          href: "/events/new",
          busy: true,
          children: text("New event"),
        });
        const link = screen.getByRole("link");
        await expect.element(link).toHaveAttribute("aria-busy", "true");
        await link.click();
        expect(followed).not.toHaveBeenCalled();
      } finally {
        document.removeEventListener("click", watch);
      }
    });

    test("calls onclick again once it's no longer busy", async () => {
      const onclick = vi.fn();
      const screen = await renderIn("light", Button, {
        busy: true,
        onclick,
        children: text("Save"),
      });
      await screen.rerender({ busy: false });
      await screen.getByRole("button").click();
      expect(onclick).toHaveBeenCalledOnce();
    });
  });

  describe("pressed", () => {
    test.each([
      [true, "true"],
      [false, "false"],
    ])("pressed={%s} is a toggle announced as %s", async (pressed, state) => {
      const screen = await renderIn("light", Button, {
        pressed,
        children: text("Show offline"),
      });
      await expect
        .element(screen.getByRole("button", { name: "Show offline", pressed }))
        .toHaveAttribute("aria-pressed", state);
    });

    test("isn't a toggle when pressed is left out", async () => {
      const screen = await renderIn("light", Button, {
        children: text("Save"),
      });
      await expect
        .element(screen.getByRole("button"))
        .not.toHaveAttribute("aria-pressed");
    });

    // Not by colour alone (WCAG 1.4.1): a mark that is filled when on and
    // hollow when off, as the community site's ActionToggle has.
    test.each([
      [true, "rgb(15, 23, 42)"],
      [false, transparent],
    ])("pressed={%s} shows its state by shape", async (pressed, fill) => {
      const screen = await renderIn("light", Button, {
        variant: "secondary",
        pressed,
        children: text("Show offline"),
      });
      const mark = screen.container.querySelector<HTMLElement>(
        "[data-pressed-mark]",
      );
      await expect.element(mark).toHaveAttribute("aria-hidden", "true");
      await expect.element(mark).toHaveStyle({
        borderStyle: "solid",
        borderColor: "rgb(15, 23, 42)",
        backgroundColor: fill,
      });
    });

    test("toggles from the keyboard when the app flips pressed", async () => {
      let pressed = false;
      const screen = await renderIn("light", Button, {
        pressed,
        onclick: () => {
          pressed = !pressed;
          screen.rerender({ pressed });
        },
        children: text("Show offline"),
      });
      await userEvent.tab();
      await userEvent.keyboard(" ");
      await expect
        .element(screen.getByRole("button"))
        .toHaveAttribute("aria-pressed", "true");
      await userEvent.keyboard("{Enter}");
      await expect
        .element(screen.getByRole("button"))
        .toHaveAttribute("aria-pressed", "false");
    });
  });

  test("runs onclick from Enter and Space", async () => {
    const onclick = vi.fn();
    await renderIn("light", Button, { onclick, children: text("Save") });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onclick).toHaveBeenCalledTimes(2);
  });

  // The guide's `ring` role: #0284C7 light, #0EA5E9 dark.
  test.each([
    ["light", "rgb(2, 132, 199)"],
    ["dark", "rgb(14, 165, 233)"],
    ["dark-header", "rgb(14, 165, 233)"],
  ] as const)(
    "shows a ring outline when tabbed to in %s",
    async (scheme, colour) => {
      const screen = await renderIn(scheme, Button, {
        children: text("Save"),
      });
      await userEvent.tab();
      const button = screen.getByRole("button");
      await expect.element(button).toHaveFocus();
      await expect.element(button).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: colour,
      });
    },
  );

  test("as a link, shows the ring outline too", async () => {
    const screen = await renderIn("light", Button, {
      href: "/events/new",
      children: text("New event"),
    });
    await userEvent.tab();
    await expect.element(screen.getByRole("link")).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: "rgb(2, 132, 199)",
    });
  });

  test("can be disabled, and then can't be pressed", async () => {
    const onclick = vi.fn();
    const screen = await renderIn("light", Button, {
      disabled: true,
      onclick,
      children: text("Save"),
    });
    const button = screen.getByRole("button");
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onclick).not.toHaveBeenCalled();
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Button, {
      type: "submit",
      id: "save",
      class: "ml-4",
      children: text("Save"),
    });
    const button = screen.getByRole("button");
    await expect.element(button).toHaveAttribute("type", "submit");
    await expect.element(button).toHaveAttribute("id", "save");
    await expect.element(button).toHaveStyle({
      marginLeft: "16px",
      backgroundColor: "rgb(3, 105, 161)",
    });
  });

  test("is primary when no variant is given", async () => {
    const screen = await renderIn("light", Button, { children: text("Save") });
    await expect
      .element(screen.getByRole("button"))
      .toHaveStyle({ backgroundColor: "rgb(3, 105, 161)" });
  });
});
