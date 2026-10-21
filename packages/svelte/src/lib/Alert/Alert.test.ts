// Each level's label, role and icon are severity's, tested in
// severity/severity.node.test.ts and SeverityIcon.test.ts; the close
// button's looks are CloseButton's.
import { describe, expect, test } from "vitest";
import { userEvent } from "vitest/browser";
import { translucent } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import { SEVERITIES, type Severity } from "../severity/severity.ts";
import Alert from "./Alert.svelte";

describe("Alert", () => {
  test.each([
    ["info", "status", "Info: The roster updates nightly."],
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

  test("when dismissible, a button named after the message, not its title, closes it", async () => {
    let dismissed = 0;
    const screen = await renderIn("light", Alert, {
      level: "danger",
      title: "Not saved",
      dismissible: true,
      ondismiss: () => dismissed++,
      children: text("We couldn't save the roster."),
    });
    const close = screen.getByRole("button", {
      name: "Dismiss We couldn't save the roster.",
    });

    await userEvent.tab();
    await expect.element(close).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(screen.getByRole("alert")).not.toBeInTheDocument();
    expect(dismissed).toBe(1);
  });

  test("draws its level's icon, and the message in body text", async () => {
    const screen = await renderIn("light", Alert, {
      level: "caution",
      children: text("The roster updates nightly."),
    });
    const icon = screen.getByRole("status").element().querySelector("svg path");
    expect(icon?.getAttribute("d")).toBe(SEVERITIES.caution.icon);
    await expect
      .element(screen.getByText("The roster updates nightly."))
      .toHaveStyle({ color: role("foreground-soft", "light") });
  });

  // A wash and a faint border of the level's role, so the page shows
  // through.
  test.each(Object.keys(SEVERITIES) as Severity[])(
    "%s is tinted in its role",
    async (level) => {
      const screen = await renderIn("light", Alert, {
        level,
        children: text("The roster updates nightly."),
      });
      const colour = role(SEVERITIES[level].role, "light");
      await expect
        .element(screen.getByRole(SEVERITIES[level].live))
        .toHaveStyle({
          backgroundColor: translucent(colour, 10),
          borderTopColor: translucent(colour, 40),
          borderTopWidth: "1px",
        });
    },
  );
});
