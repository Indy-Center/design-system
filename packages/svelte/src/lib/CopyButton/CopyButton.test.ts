import { afterEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import CopyButton from "./CopyButton.svelte";

describe("CopyButton", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('is a button named "Copy" and what it copies', async () => {
    const screen = await renderIn("light", CopyButton, {
      text: "134.000",
      label: "frequency",
    });
    await expect
      .element(screen.getByRole("button", { name: "Copy frequency" }))
      .toHaveAttribute("type", "button");
  });

  test("puts its text on the clipboard when pressed", async () => {
    const write = clipboard();
    const screen = await renderIn("light", CopyButton, {
      text: "134.000",
      label: "frequency",
    });
    await screen.getByRole("button").click();
    expect(write).toHaveBeenCalledExactlyOnceWith("134.000");
  });

  test('says "Copied" for a moment', async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    clipboard();
    const screen = await renderIn("light", CopyButton, {
      text: "ZID_CTR",
      label: "callsign",
    });
    const status = screen.getByRole("status");
    await expect.element(status).toHaveTextContent("");
    await screen.getByRole("button").click();
    await expect.element(status).toHaveTextContent("Copied");
    await expect.element(status.getByText("Copied")).toBeVisible();
    vi.advanceTimersByTime(2000);
    await expect.element(status).toHaveTextContent("");
    // The button keeps its name, so it isn't read twice.
    await expect
      .element(screen.getByRole("button", { name: "Copy callsign" }))
      .toBeInTheDocument();
  });

  test("copies from the keyboard", async () => {
    const write = clipboard();
    const screen = await renderIn("light", CopyButton, {
      text: "ZID_CTR",
      label: "callsign",
    });
    await userEvent.tab();
    await expect.element(screen.getByRole("button")).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(write).toHaveBeenCalledExactlyOnceWith("ZID_CTR");
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Copied");
  });

  test.each(SCHEMES)(
    "its message is muted-foreground in %s",
    async (scheme) => {
      clipboard();
      const screen = await renderIn(scheme, CopyButton, {
        text: "ZID_CTR",
        label: "callsign",
      });
      await screen.getByRole("button").click();
      await expect
        .element(screen.getByText("Copied"))
        .toHaveStyle({ color: role("muted-foreground", scheme) });
    },
  );

  test("puts class on its box and other attributes on the button", async () => {
    const screen = await renderIn("light", CopyButton, {
      text: "ZID_CTR",
      label: "callsign",
      class: "ml-2",
      id: "copy-callsign",
    });
    const button = screen.getByRole("button");
    await expect.element(button).toHaveAttribute("id", "copy-callsign");
    await expect.element(button).not.toHaveClass("ml-2");
    expect(button.element().parentElement).toHaveClass("ml-2");
  });

  test("says so if copying failed", async () => {
    clipboard(true);
    const screen = await renderIn("light", CopyButton, {
      text: "1234567",
      label: "CID",
    });
    await screen.getByRole("button").click();
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Couldn't copy");
  });

  test("says it again when pressed again", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    clipboard();
    const screen = await renderIn("light", CopyButton, {
      text: "ZID_CTR",
      label: "callsign",
    });
    const status = screen.getByRole("status");
    const button = screen.getByRole("button");
    await button.click();
    await expect.element(status).toHaveTextContent("Copied");
    vi.advanceTimersByTime(1500);
    await button.click();
    // The region empties for a moment, so the refill is a change a screen
    // reader announces.
    await expect.element(status).toHaveTextContent("");
    vi.advanceTimersByTime(100);
    await expect.element(status).toHaveTextContent("Copied");
    // The second press starts the moment over.
    vi.advanceTimersByTime(1500);
    await expect.element(status).toHaveTextContent("Copied");
    vi.advanceTimersByTime(500);
    await expect.element(status).toHaveTextContent("");
  });

  test("does nothing if removed before the copy finishes", async () => {
    let finish!: () => void;
    vi.spyOn(navigator.clipboard, "writeText").mockImplementation(
      () => new Promise<void>((resolve) => (finish = resolve)),
    );
    const timeout = vi.spyOn(window, "setTimeout");
    const screen = await renderIn("light", CopyButton, {
      text: "ZID_CTR",
      label: "callsign",
    });
    await screen.getByRole("button").click();
    screen.unmount();
    timeout.mockClear();
    finish();
    await Promise.resolve();
    await Promise.resolve();
    expect(timeout).not.toHaveBeenCalled();
  });
});

/** Stands in for the browser's clipboard, which asks the member first. */
function clipboard(fails = false) {
  return vi
    .spyOn(navigator.clipboard, "writeText")
    .mockImplementation(() =>
      fails
        ? Promise.reject(new DOMException("Denied", "NotAllowedError"))
        : Promise.resolve(),
    );
}
