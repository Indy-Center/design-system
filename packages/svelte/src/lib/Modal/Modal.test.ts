import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import PositionRequest from "../../../test/PositionRequest.svelte";
import { role } from "../../../test/roles.ts";
import { renderIn, type Scheme } from "../../../test/schemes.ts";
import { text } from "../../../test/snippets.ts";
import Modal from "./Modal.svelte";

const dialog = () => page.getByRole("dialog", { name: "Request position" });

// Opens it from its button, by keyboard, so focus starts on the button.
async function openIn(scheme: Scheme, props = {}) {
  const screen = await renderIn(scheme, PositionRequest, props);
  const trigger = screen.getByRole("button", { name: "Request position" });
  trigger.element().focus();
  await userEvent.keyboard("{Enter}");
  await expect.element(dialog()).toBeVisible();
  return { screen, trigger };
}

describe("Modal", () => {
  test("is a dialog named by its heading once opened", async () => {
    const screen = await renderIn("light", PositionRequest, {});
    await expect.element(dialog()).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Request position" }),
    );
    await expect.element(dialog()).toBeVisible();
    await expect
      .element(dialog().getByRole("heading", { level: 2 }))
      .toHaveTextContent("Request position");
    // Modal: the page behind it is inert.
    expect(document.querySelector("dialog:modal")).not.toBeNull();
  });

  test("moves focus in when it opens, and back when it closes", async () => {
    const { trigger } = await openIn("light");
    // The first control: the close button in its header.
    await expect
      .element(dialog().getByRole("button", { name: "Close" }))
      .toHaveFocus();
    await userEvent.tab();
    await expect.element(dialog().getByRole("textbox")).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
  });

  test("returns focus when the page removes it while open", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    try {
      const screen = await renderIn("light", Modal, {
        open: true,
        title: "Request position",
        children: text("Ask for a position."),
      });
      await expect.element(dialog()).toBeVisible();
      screen.unmount();
      await expect.element(trigger).toHaveFocus();
    } finally {
      trigger.remove();
    }
  });

  test("Escape closes it and tells the page", async () => {
    const onclose = vi.fn();
    await openIn("light", { onclose });
    await userEvent.keyboard("{Escape}");
    await expect.element(dialog()).not.toBeInTheDocument();
    expect(onclose).toHaveBeenCalledOnce();
  });

  test("its close button is named and closes it", async () => {
    const onclose = vi.fn();
    const { trigger } = await openIn("light", { onclose });
    await userEvent.click(dialog().getByRole("button", { name: "Close" }));
    await expect.element(dialog()).not.toBeInTheDocument();
    expect(onclose).toHaveBeenCalledOnce();
    await expect.element(trigger).toHaveFocus();
  });

  test("a click outside closes it; a click inside doesn't", async () => {
    await openIn("light");
    await userEvent.click(dialog().getByRole("heading"));
    await expect.element(dialog()).toBeVisible();
    // Above its top-left corner: on the backdrop.
    await userEvent.click(dialog(), { position: { x: 4, y: -20 } });
    await expect.element(dialog()).not.toBeInTheDocument();
  });

  // A press and release in different places click their shared parent, the
  // dialog; only one wholly outside closes it.
  test.each([
    ["starts inside and ends outside", { x: 40, y: 40 }, { x: 4, y: -20 }],
    ["starts outside and ends inside", { x: 4, y: -20 }, { x: 40, y: 40 }],
    ["is on its border", { x: 0, y: 40 }, { x: 0, y: 40 }],
  ])("a press that %s doesn't close it", async (_, down, up) => {
    await openIn("light");
    const box = dialog().element().getBoundingClientRect();
    const at = ({ x, y }: { x: number; y: number }) => ({
      bubbles: true,
      clientX: box.left + x,
      clientY: box.top + y,
    });
    dialog()
      .element()
      .dispatchEvent(new PointerEvent("pointerdown", at(down)));
    dialog()
      .element()
      .dispatchEvent(new MouseEvent("click", at(up)));
    await expect.element(dialog()).toBeVisible();
  });

  test("closes when the page sets open to false", async () => {
    const onclose = vi.fn();
    await openIn("light", { withActions: true, onclose });
    await userEvent.click(
      dialog().getByRole("button", { name: "Send request" }),
    );
    await expect.element(dialog()).not.toBeInTheDocument();
    expect(onclose).toHaveBeenCalledOnce();
  });

  test("puts its actions at the foot, after the content", async () => {
    await openIn("light", { withActions: true });
    const names = dialog()
      .getByRole("button")
      .elements()
      .map((b) => b.getAttribute("aria-label") ?? b.textContent?.trim());
    expect(names).toEqual(["Close", "Send request"]);
  });

  test("passes class and attributes to the dialog", async () => {
    await openIn("light", { class: "mt-8", "data-testid": "modal" });
    await expect.element(dialog()).toHaveClass("mt-8");
    await expect.element(dialog()).toHaveAttribute("data-testid", "modal");
  });

  test("grows to its size's width", async () => {
    await openIn("light", { size: "lg" });
    await expect.element(dialog()).toHaveStyle({ maxWidth: "672px" });
  });

  test.each(SCHEMES)(
    "is a card with the title in the heading colour in %s",
    async (scheme) => {
      await openIn(scheme);
      await expect.element(dialog()).toHaveStyle({
        backgroundColor: role("card", scheme),
        borderTopColor: role("border", scheme),
      });
      await expect
        .element(dialog().getByRole("heading"))
        .toHaveStyle({ color: role("foreground", scheme) });
    },
  );
});
