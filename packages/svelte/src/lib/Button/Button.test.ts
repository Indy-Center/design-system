import { createRawSnippet } from "svelte";
import { describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
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
    await expect.element(screen.getByRole("button")).not.toBeInTheDocument();
  });

  // primary: `primary` under `primary-foreground`. secondary: no fill
  // (transparent), `input` edge, `foreground` text. danger: `destructive`
  // under `card`.
  const transparent = "rgba(0, 0, 0, 0)";
  const looks = {
    primary: { fill: "primary", ink: "primary-foreground" },
    secondary: { fill: null, ink: "foreground" },
    danger: { fill: "destructive", ink: "card" },
  } as const;
  test.each(
    (["primary", "secondary", "danger"] as const).flatMap((variant) =>
      SCHEMES.map((scheme) => [variant, scheme] as const),
    ),
  )("%s in %s", async (variant, scheme) => {
    const { fill, ink } = looks[variant];
    const screen = await renderIn(scheme, Button, {
      variant,
      children: text("Save"),
    });
    await expect.element(screen.getByRole("button")).toHaveStyle({
      backgroundColor: fill ? role(fill, scheme) : transparent,
      color: role(ink, scheme),
    });
  });

  // `primary-hover`, and `muted`.
  test.each([
    ["primary", "light", "primary-hover"],
    ["primary", "dark", "primary-hover"],
    ["primary", "dark-header", "primary-hover"],
    ["secondary", "light", "muted"],
    ["secondary", "dark", "muted"],
    ["secondary", "dark-header", "muted"],
  ] as const)("%s on hover in %s", async (variant, scheme, fill) => {
    const screen = await renderIn(scheme, Button, {
      variant,
      children: text("Save"),
    });
    const button = screen.getByRole("button");
    await userEvent.hover(button);
    await expect
      .element(button)
      .toHaveStyle({ backgroundColor: role(fill, scheme) });
  });

  // danger's hover is no role of its own: `destructive` at 90%, as the
  // browser mixes it.
  const at90 = (colour: string) => {
    const probe = document.createElement("div");
    probe.style.backgroundColor = `color-mix(in oklab, ${colour} 90%, transparent)`;
    document.body.append(probe);
    const mixed = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return mixed;
  };
  test.each(SCHEMES)("danger on hover in %s", async (scheme) => {
    const screen = await renderIn(scheme, Button, {
      variant: "danger",
      children: text("Delete"),
    });
    const button = screen.getByRole("button");
    await userEvent.hover(button);
    await expect
      .poll(() => getComputedStyle(button.element()).backgroundColor)
      .toBe(at90(role("destructive", scheme)));
  });

  // The `input` role.
  test.each(SCHEMES)(
    "secondary has an edge in the input colour in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Button, {
        variant: "secondary",
        children: text("Cancel"),
      });
      await expect.element(screen.getByRole("button")).toHaveStyle({
        borderStyle: "solid",
        borderColor: role("input", scheme),
      });
    },
  );

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

    test("has no status when busy is left out", async () => {
      const screen = await renderIn("light", Button, {
        children: text("Save"),
      });
      await expect
        .element(screen.getByRole("button"))
        .not.toHaveAttribute("aria-busy");
      expect(screen.getByRole("status").elements()).toEqual([]);
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

    // Not by colour alone (WCAG 1.4.1): a mark before the text, filled
    // when on and hollow when off, as the community site's ActionToggle
    // has. It's the button's ::before, in its text colour: secondary's
    // `foreground`.
    const mark = (element: Element) => getComputedStyle(element, "::before");
    test.each(
      SCHEMES.flatMap((scheme) => [
        [true, scheme] as const,
        [false, scheme] as const,
      ]),
    )(
      "pressed={%s} shows its state by shape in %s",
      async (pressed, scheme) => {
        const ink = role("foreground", scheme);
        const screen = await renderIn(scheme, Button, {
          variant: "secondary",
          pressed,
          children: text("Show offline"),
        });
        const style = mark(screen.getByRole("button").element());
        expect(style.width).toBe("12px");
        expect(style.borderStyle).toBe("solid");
        expect(style.borderColor).toBe(ink);
        expect(style.backgroundColor).toBe(pressed ? ink : transparent);
      },
    );

    test("has no mark when pressed is left out", async () => {
      const screen = await renderIn("light", Button, {
        children: text("Save"),
      });
      expect(mark(screen.getByRole("button").element()).content).toBe("none");
    });

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

  test("runs onclick from Enter and Space", async () => {
    const onclick = vi.fn();
    await renderIn("light", Button, { onclick, children: text("Save") });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onclick).toHaveBeenCalledTimes(2);
  });

  // The `ring` role.
  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, Button, {
        children: text("Save"),
      });
      await userEvent.tab();
      const button = screen.getByRole("button");
      await expect.element(button).toHaveFocus();
      await expect.element(button).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
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

  test("is primary when no variant is given", async () => {
    const screen = await renderIn("light", Button, { children: text("Save") });
    await expect
      .element(screen.getByRole("button"))
      .toHaveStyle({ backgroundColor: role("primary", "light") });
  });
});
