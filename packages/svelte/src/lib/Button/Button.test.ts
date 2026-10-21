import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import Button from "./Button.svelte";

describe("Button", () => {
  // With no variant or size: primary, and md's text-base, as Input's text.
  test('is a primary md button named by its text, of type "button"', async () => {
    const screen = await renderIn("light", Button, { children: text("Save") });
    const button = screen.getByRole("button", { name: "Save" });
    await expect.element(button).toHaveAttribute("type", "button");
    await expect.element(button).toHaveStyle({
      backgroundColor: role("primary", "light"),
      fontSize: "16px",
    });
  });

  test("is a link when given an href", async () => {
    const screen = await renderIn("light", Button, {
      href: "/events/new",
      children: text("New event"),
    });
    const link = screen.getByRole("link", { name: "New event" });
    await expect.element(link).toHaveAttribute("href", "/events/new");
    await expect.element(link).not.toHaveAttribute("type");
    await expect.element(screen.getByRole("button")).not.toBeInTheDocument();
  });

  // primary: `primary` under `primary-foreground`. secondary: no fill
  // (transparent), an `input` edge, `foreground` text. danger: `destructive`
  // under `card`.
  const transparent = "rgba(0, 0, 0, 0)";
  test.each([
    {
      variant: "primary",
      look: {
        backgroundColor: role("primary", "light"),
        color: role("primary-foreground", "light"),
      },
    },
    {
      variant: "secondary",
      look: {
        backgroundColor: transparent,
        color: role("foreground", "light"),
        borderStyle: "solid",
        borderColor: role("input", "light"),
      },
    },
    {
      variant: "danger",
      look: {
        backgroundColor: role("destructive", "light"),
        color: role("card", "light"),
      },
    },
  ] as const)("$variant", async ({ variant, look }) => {
    const screen = await renderIn("light", Button, {
      variant,
      children: text("Save"),
    });
    await expect.element(screen.getByRole("button")).toHaveStyle(look);
  });

  // `primary-hover`, and `muted`. danger's is no role of its own:
  // `destructive` at 90%, as the browser mixes it. The fill changes by a
  // `transition-colors` that reduced motion doesn't stop, so each waits
  // with expect.element, which retries.
  test.each([
    ["primary", () => role("primary-hover", "light")],
    ["secondary", () => role("muted", "light")],
    ["danger", () => translucent(role("destructive", "light"), 90)],
  ] as const)("%s on hover", async (variant, fill) => {
    const screen = await renderIn("light", Button, {
      variant,
      children: text("Save"),
    });
    const button = screen.getByRole("button");
    await userEvent.hover(button);
    await expect.element(button).toHaveStyle({ backgroundColor: fill() });
  });

  // Tailwind's text-sm, text-base and text-lg; and WCAG 2.5.8 and the
  // conventions: every control at least 44px each way, even holding one
  // letter.
  test.each([
    ["sm", "14px"],
    ["md", "16px"],
    ["lg", "18px"],
  ] as const)(
    "%s is %s text, and at least 44px tall and wide",
    async (size, fontSize) => {
      const screen = await renderIn("light", Button, {
        size,
        children: text("+"),
      });
      const button = screen.getByRole("button");
      await expect.element(button).toHaveStyle({ fontSize });
      const box = button.element().getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
    },
  );

  test("with busy and pressed left out, has no status, mark or toggle", async () => {
    const screen = await renderIn("light", Button, {
      children: text("Save"),
    });
    const button = screen.getByRole("button");
    await expect.element(button).not.toHaveAttribute("aria-busy");
    await expect.element(button).not.toHaveAttribute("aria-pressed");
    expect(screen.getByRole("status").elements()).toEqual([]);
    expect(getComputedStyle(button.element(), "::before").content).toBe("none");
  });

  describe("busy", () => {
    // Readers hold back updates inside an aria-busy element, and a
    // button's children are presentational, so the status sits beside the
    // button. It is there before busy starts, so the change is announced.
    test('says "Working" through a status beside it, when busy starts', async () => {
      const screen = await renderIn("light", Button, {
        busy: false,
        children: text("Save"),
      });
      const status = screen.getByRole("status");
      await expect.element(status).toHaveTextContent("");
      await screen.rerender({ busy: true });
      await expect.element(status).toHaveTextContent("Working");
      const button = screen.getByRole("button");
      await expect.element(button).toHaveAttribute("aria-busy", "true");
      expect(button.element().contains(status.element())).toBe(false);
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

    test("goes quiet when busy ends", async () => {
      const screen = await renderIn("light", Button, {
        busy: true,
        children: text("Save"),
      });
      await screen.rerender({ busy: false });
      await expect.element(screen.getByRole("status")).toHaveTextContent("");
      await expect
        .element(screen.getByRole("button"))
        .not.toHaveAttribute("aria-busy");
    });

    test("shows a spinner inside, hidden from readers", async () => {
      const screen = await renderIn("light", Button, {
        busy: true,
        children: text("Save"),
      });
      const button = screen.getByRole("button");
      const spinner = button.getByRole("status", { includeHidden: true });
      await expect.element(spinner).toBeVisible();
      expect(button.getByRole("status").elements()).toEqual([]);
    });

    test("keeps its name, text and focus", async () => {
      const screen = await renderIn("light", Button, {
        busy: true,
        children: text("Save"),
      });
      const button = screen.getByRole("button", { name: "Save", exact: true });
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
      form.id = "busy-form";
      const onsubmit = vi.fn((e: Event) => e.preventDefault());
      form.addEventListener("submit", onsubmit);
      document.body.append(form);
      try {
        // Joined to the form by its `form` attribute.
        const screen = await renderIn("light", Button, {
          busy: true,
          type: "submit",
          form: "busy-form",
          children: text("Save"),
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

    test("as a link, doesn't open in a new tab from a middle-click", async () => {
      const opened = vi.fn();
      const watch = (e: Event) => {
        if (!e.defaultPrevented) opened();
        e.preventDefault(); // keep the test from opening a tab
      };
      document.addEventListener("auxclick", watch);
      try {
        const screen = await renderIn("light", Button, {
          href: "/events/new",
          busy: true,
          children: text("New event"),
        });
        await screen.getByRole("link").click({ button: "middle" });
        expect(opened).not.toHaveBeenCalled();
      } finally {
        document.removeEventListener("auxclick", watch);
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
    // Not by colour alone (WCAG 1.4.1): a mark before the text, filled
    // when on and hollow when off, as the community site's ActionToggle
    // has. It's the button's ::before, in its text colour: secondary's
    // `foreground`.
    const mark = (element: Element) => getComputedStyle(element, "::before");
    test.each([
      [true, "true"],
      [false, "false"],
    ])(
      "pressed={%s} is a toggle announced as %s, shown by shape",
      async (pressed, state) => {
        const ink = role("foreground", "light");
        const screen = await renderIn("light", Button, {
          variant: "secondary",
          pressed,
          children: text("Show offline"),
        });
        const button = screen.getByRole("button", {
          name: "Show offline",
          pressed,
        });
        await expect.element(button).toHaveAttribute("aria-pressed", state);
        const style = mark(button.element());
        expect(style.width).toBe("12px");
        expect(style.borderStyle).toBe("solid");
        expect(style.borderColor).toBe(ink);
        expect(style.backgroundColor).toBe(pressed ? ink : transparent);
      },
    );

    test("as a link, is never a toggle", async () => {
      // The types forbid this; an untyped caller still gets a plain link.
      const screen = await renderIn("light", Button, {
        href: "/events/new",
        pressed: true as unknown as undefined,
        children: text("New event"),
      });
      const link = screen.getByRole("link");
      await expect.element(link).not.toHaveAttribute("aria-pressed");
      expect(mark(link.element()).content).toBe("none");
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

  // The `ring` role.
  test("shows a ring outline when tabbed to", async () => {
    const screen = await renderIn("light", Button, {
      children: text("Save"),
    });
    await userEvent.tab();
    const button = screen.getByRole("button");
    await expect.element(button).toHaveFocus();
    await expect.element(button).toHaveStyle({
      outlineStyle: "solid",
      outlineColor: role("ring", "light"),
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
      backgroundColor: role("primary", "light"),
    });
  });
});
