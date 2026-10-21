import { createRawSnippet } from "svelte";
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role, type Role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import type { Severity } from "../severity/severity.ts";
import Alert from "./Alert.svelte";

const text = (s: string) =>
  createRawSnippet(() => ({ render: () => `<span>${s}</span>` }));

describe("Alert", () => {
  test.each([
    ["info", "status", "Info: The roster updates nightly."],
    ["success", "status", "Success: The roster updates nightly."],
    ["caution", "status", "Caution: The roster updates nightly."],
    ["danger", "alert", "Danger: The roster updates nightly."],
  ] as [Severity, string, string][])(
    "%s is a %s that reads its label first",
    async (level, role, read) => {
      const screen = await renderIn("light", Alert, {
        level,
        children: text("The roster updates nightly."),
      });
      await expect.element(screen.getByRole(role)).toHaveTextContent(read);
    },
  );

  test("reads the label before an optional title, which is in the heading colour", async () => {
    const screen = await renderIn("light", Alert, {
      level: "caution",
      title: "Session soon",
      children: text("Your session starts in 10 minutes."),
    });
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent(
        "Caution: Session soon Your session starts in 10 minutes.",
      );
    await expect
      .element(screen.getByText("Session soon"))
      .toHaveStyle({ color: role("foreground", "light"), fontWeight: "600" });
  });

  test("has no close button unless it's dismissible", async () => {
    const screen = await renderIn("light", Alert, {
      level: "info",
      children: text("The roster updates nightly."),
    });
    await expect.element(screen.getByRole("button")).not.toBeInTheDocument();
  });

  test("when dismissible, a 44px button named after the message closes it from the keyboard", async () => {
    let dismissed = 0;
    const screen = await renderIn("light", Alert, {
      level: "danger",
      dismissible: true,
      ondismiss: () => dismissed++,
      children: text("We couldn't save the roster."),
    });
    const close = screen.getByRole("button", {
      name: "Dismiss We couldn't save the roster.",
    });
    await expect
      .element(close)
      .toHaveStyle({ minWidth: "44px", minHeight: "44px" });

    await userEvent.tab();
    await expect.element(close).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
    expect(dismissed).toBe(1);
  });

  test("names the close button after the message, even with a title", async () => {
    const screen = await renderIn("light", Alert, {
      level: "info",
      title: "Roster updates",
      dismissible: true,
      children: text("The roster updates nightly."),
    });
    await expect
      .element(
        screen.getByRole("button", {
          name: "Dismiss The roster updates nightly.",
        }),
      )
      .toBeInTheDocument();
  });

  // The level's role for the icon, and foreground-soft (body text) for the
  // message.
  const levelRole: Record<Severity, Role> = {
    info: "info",
    success: "success",
    caution: "warning",
    danger: "destructive",
  };

  describe.each(SCHEMES)("in %s", (scheme) => {
    test.each(["info", "success", "caution", "danger"] as Severity[])(
      "%s has its role's icon and tint, and body text",
      async (level) => {
        const screen = await renderIn(scheme, Alert, {
          level,
          children: text("The roster updates nightly."),
        });
        const box = screen.container.querySelector<HTMLElement>(
          "[role=alert], [role=status]",
        )!;
        await expect
          .element(box.querySelector<SVGElement>("svg path"))
          .toHaveStyle({ fill: role(levelRole[level], scheme) });
        await expect
          .element(screen.getByText("The roster updates nightly."))
          .toHaveStyle({ color: role("foreground-soft", scheme) });
        // A wash and a faint border of the role's colour, so the page shows
        // through.
        const style = getComputedStyle(box);
        expect(style.backgroundColor).toMatch(/\/ 0\.1\)$/);
        expect(style.borderTopColor).toMatch(/\/ 0\.4\)$/);
        expect(style.borderTopWidth).toBe("1px");
      },
    );
  });
});
