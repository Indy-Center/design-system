import { afterEach, describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import ConfirmDialog from "./ConfirmDialog.svelte";
import { confirmAction } from "./confirmAction.ts";

const dialog = () => page.getByRole("alertdialog", { name: "Delete event?" });
const message = "FNO Chicago will be removed for everyone.";

function props(more = {}) {
  return {
    open: true,
    title: "Delete event?",
    confirmLabel: "Delete event",
    children: text(message),
    ...more,
  };
}

const buttons: HTMLButtonElement[] = [];
afterEach(() => {
  for (const b of buttons.splice(0)) b.remove();
});

// A button on the page, focused, that asks when pressed.
function askFrom(ask: () => Promise<boolean>) {
  const button = document.createElement("button");
  button.textContent = "Delete";
  document.body.append(button);
  buttons.push(button);
  button.focus();
  let answer: Promise<boolean> | undefined;
  button.addEventListener("click", () => (answer = ask()));
  button.click();
  return { button, answer: () => answer! };
}

describe("ConfirmDialog", () => {
  test("is an alert dialog named by its title and described by its message", async () => {
    await renderIn("light", ConfirmDialog, props());
    await expect.element(dialog()).toBeVisible();
    await expect.element(dialog()).toHaveAccessibleDescription(message);
  });

  test("confirming calls onconfirm and closes", async () => {
    const onconfirm = vi.fn();
    const oncancel = vi.fn();
    await renderIn("light", ConfirmDialog, props({ onconfirm, oncancel }));
    await userEvent.click(
      dialog().getByRole("button", { name: "Delete event" }),
    );
    await expect.element(dialog()).not.toBeInTheDocument();
    expect(onconfirm).toHaveBeenCalledOnce();
    expect(oncancel).not.toHaveBeenCalled();
  });

  test.each([
    ["its Cancel button", () => userEvent.click(page.getByText("Cancel"))],
    ["Escape", () => userEvent.keyboard("{Escape}")],
    [
      "its close button",
      () => userEvent.click(page.getByRole("button", { name: "Close" })),
    ],
    [
      "a click outside",
      () => userEvent.click(dialog(), { position: { x: 4, y: -20 } }),
    ],
  ])("%s cancels", async (_, act) => {
    const onconfirm = vi.fn();
    const oncancel = vi.fn();
    await renderIn("light", ConfirmDialog, props({ onconfirm, oncancel }));
    await expect.element(dialog()).toBeVisible();
    await act();
    await expect.element(dialog()).not.toBeInTheDocument();
    expect(oncancel).toHaveBeenCalledOnce();
    expect(onconfirm).not.toHaveBeenCalled();
  });

  test("names its cancel button as asked", async () => {
    await renderIn("light", ConfirmDialog, props({ cancelLabel: "Keep it" }));
    await expect
      .element(dialog().getByRole("button", { name: "Keep it" }))
      .toBeVisible();
  });

  test("starts on the confirm button, which is primary", async () => {
    await renderIn("light", ConfirmDialog, props());
    const confirm = dialog().getByRole("button", { name: "Delete event" });
    await expect.element(confirm).toHaveFocus();
    await expect
      .element(confirm)
      .toHaveStyle({ backgroundColor: role("primary", "light") });
  });

  test.each(SCHEMES)(
    "danger: the confirm button is destructive and focus starts on Cancel, in %s",
    async (scheme) => {
      await renderIn(scheme, ConfirmDialog, props({ danger: true }));
      await expect
        .element(dialog().getByRole("button", { name: "Delete event" }))
        .toHaveStyle({ backgroundColor: role("destructive", scheme) });
      await expect
        .element(dialog().getByRole("button", { name: "Cancel" }))
        .toHaveFocus();
    },
  );
});

describe("confirmAction", () => {
  test("resolves true when confirmed, then removes its dialog and returns focus", async () => {
    const asking = askFrom(() =>
      confirmAction({
        title: "Delete event?",
        message,
        confirmLabel: "Delete event",
        danger: true,
      }),
    );
    await expect.element(dialog()).toHaveAccessibleDescription(message);
    await userEvent.click(
      dialog().getByRole("button", { name: "Delete event" }),
    );
    await expect(asking.answer()).resolves.toBe(true);
    expect(document.querySelector("dialog")).toBeNull();
    expect(document.activeElement).toBe(asking.button);
  });

  test("resolves false when cancelled", async () => {
    const asking = askFrom(() =>
      confirmAction({ title: "Delete event?", message }),
    );
    // Without a label, the confirm button says "Confirm".
    await expect
      .element(dialog().getByRole("button", { name: "Confirm" }))
      .toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(asking.answer()).resolves.toBe(false);
    expect(document.querySelector("dialog")).toBeNull();
  });
});
