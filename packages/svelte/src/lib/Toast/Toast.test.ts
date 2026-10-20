import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import type { Severity } from "../severity/severity.ts";
import Toaster from "./Toaster.svelte";
import { toast } from "./toast.svelte.ts";

const notifications = () => document.querySelector("section[aria-label]");

describe("Toast", () => {
  // The toasts' clock runs only when a test moves it on.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test("shows a toast with its label and message", async () => {
    const screen = await renderIn("light", Toaster, {});
    toast("success", "Roster saved.");
    const list = screen.getByRole("region", { name: "Notifications" });
    await expect
      .element(list.getByRole("listitem"))
      .toHaveTextContent("Success: Roster saved.");
  });

  test("announces it politely, and danger assertively", async () => {
    const screen = await renderIn("light", Toaster, {});
    toast("success", "Roster saved.");
    toast("danger", "We couldn't save the roster.");
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Success: Roster saved.");
    await expect
      .element(screen.getByRole("alert"))
      .toHaveTextContent("Danger: We couldn't save the roster.");
    // The toasts themselves aren't live, so nothing is read twice.
    expect(notifications()?.querySelector("[aria-live], [role]")).toBeNull();
  });

  test("closes from its button, and focus moves to the next toast", async () => {
    const screen = await renderIn("light", Toaster, {});
    toast("info", "ZID_CTR is open.");
    toast("success", "Roster saved.");
    await userEvent.tab();
    const close = screen.getByRole("button", { name: "Dismiss Roster saved." });
    await expect.element(close).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    await expect.element(close).not.toBeInTheDocument();
    await expect
      .element(screen.getByRole("button", { name: "Dismiss ZID_CTR is open." }))
      .toHaveFocus();
  });

  test("Escape closes the newest", async () => {
    const screen = await renderIn("light", Toaster, {});
    toast("info", "ZID_CTR is open.");
    toast("success", "Roster saved.");
    await expect
      .element(screen.getByRole("listitem").nth(1))
      .toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(screen.getByRole("listitem"))
      .toHaveTextContent("Info: ZID_CTR is open.");
  });

  test("Escape is left to a menu that handled it, or an open modal", async () => {
    const screen = await renderIn("light", Toaster, {});
    toast("info", "ZID_CTR is open.");
    const item = screen.getByRole("listitem");
    await expect.element(item).toBeInTheDocument();

    const handled = (e: KeyboardEvent) => e.preventDefault();
    window.addEventListener("keydown", handled, { capture: true });
    await userEvent.keyboard("{Escape}");
    window.removeEventListener("keydown", handled, { capture: true });
    await tick();
    await expect.element(item).toBeInTheDocument();

    const dialog = document.createElement("dialog");
    dialog.innerHTML = "<button>OK</button>";
    document.body.append(dialog);
    dialog.showModal();
    await userEvent.keyboard("{Escape}");
    dialog.remove();
    await tick();
    await expect.element(item).toBeInTheDocument();
  });

  test("shows on the next page after a redirect, and is read again", async () => {
    const first = await renderIn("light", Toaster, {});
    toast("success", "Roster saved.");
    toast("caution", "Session soon.");
    await expect
      .element(first.getByRole("listitem").nth(1))
      .toBeInTheDocument();
    window.dispatchEvent(new PageTransitionEvent("pagehide"));
    first.unmount();

    const next = await renderIn("light", Toaster, {});
    await expect
      .element(next.getByRole("listitem").first())
      .toHaveTextContent("Caution: Session soon.");
    await expect
      .element(next.getByRole("listitem").nth(1))
      .toHaveTextContent("Success: Roster saved.");
    await expect
      .element(next.getByRole("status"))
      .toHaveTextContent("Success: Roster saved.Caution: Session soon.");
  });

  test("a toast raised before the Toaster mounts shows, and is read, once it does", async () => {
    toast("success", "Signed in.");
    const screen = await renderIn("light", Toaster, {});
    await expect
      .element(screen.getByRole("listitem"))
      .toHaveTextContent("Success: Signed in.");
    await expect
      .element(screen.getByRole("status"))
      .toHaveTextContent("Success: Signed in.");
  });

  // The brand guide's Roles table: the level's role for the icon and the
  // rule, on a card, with body text.
  describe.each([
    ["light", "rgb(255, 255, 255)", "rgb(51, 65, 85)"],
    ["dark", "rgb(30, 41, 59)", "rgb(209, 213, 219)"],
    ["dark-header", "rgb(30, 41, 59)", "rgb(209, 213, 219)"],
  ] as const)("in %s", (scheme, card, body) => {
    const role: Record<Severity, string> =
      scheme === "light"
        ? {
            info: "rgb(3, 105, 161)",
            success: "rgb(21, 128, 61)",
            caution: "rgb(161, 98, 7)",
            danger: "rgb(185, 28, 28)",
          }
        : {
            info: "rgb(56, 189, 248)",
            success: "rgb(74, 222, 128)",
            caution: "rgb(250, 204, 21)",
            danger: "rgb(248, 113, 113)",
          };

    test.each(["info", "success", "caution", "danger"] as Severity[])(
      "%s is a card with its role's icon and rule",
      async (level) => {
        const screen = await renderIn(scheme, Toaster, {});
        toast(level, "Roster saved.");
        const item = screen.getByRole("listitem");
        await expect.element(item).toHaveStyle({
          backgroundColor: card,
          borderLeftColor: role[level],
          borderLeftWidth: "4px",
        });
        await expect
          .element(item.element().querySelector<SVGElement>("svg path"))
          .toHaveStyle({ fill: role[level] });
        await expect
          .element(item.element().querySelector("p")!)
          .toHaveStyle({ color: body });
      },
    );
  });

  describe("stacking", () => {
    const shown = async () => {
      await tick();
      return [...document.querySelectorAll("section li p")].map((p) =>
        p.textContent?.trim(),
      );
    };

    test("shows 3 at most, newest first; the rest wait their turn", async () => {
      const screen = await renderIn("light", Toaster, {});
      for (const n of [1, 2, 3, 4]) toast("info", `Toast ${n}.`);
      expect(await shown()).toEqual([
        "Info: Toast 3.",
        "Info: Toast 2.",
        "Info: Toast 1.",
      ]);
      await screen.getByRole("button", { name: "Dismiss Toast 2." }).click();
      expect(await shown()).toEqual([
        "Info: Toast 4.",
        "Info: Toast 3.",
        "Info: Toast 1.",
      ]);
    });

    test("a more important toast sends the least important (the oldest among equals) to the front of the queue", async () => {
      await renderIn("light", Toaster, {});
      toast("info", "Oldest info.");
      toast("info", "Newer info.");
      toast("success", "Saved.");
      toast("info", "Waiting info.");
      toast("danger", "Not saved.");
      expect(await shown()).toEqual([
        "Danger: Not saved.",
        "Success: Saved.",
        "Info: Newer info.",
      ]);
      await userEvent.keyboard("{Escape}");
      expect(await shown()).toEqual([
        "Info: Oldest info.",
        "Success: Saved.",
        "Info: Newer info.",
      ]);
    });

    test("an equal or less important toast waits", async () => {
      await renderIn("light", Toaster, {});
      for (const n of [1, 2, 3]) toast("caution", `Caution ${n}.`);
      toast("caution", "Caution 4.");
      toast("info", "Info.");
      expect(await shown()).toEqual([
        "Caution: Caution 3.",
        "Caution: Caution 2.",
        "Caution: Caution 1.",
      ]);
    });

    test("waiting toasts show in the order they came", async () => {
      await renderIn("light", Toaster, {});
      for (const n of [1, 2, 3]) toast("danger", `Danger ${n}.`);
      toast("info", "Info.");
      toast("danger", "Danger 4.");
      await userEvent.keyboard("{Escape}");
      expect((await shown())[0]).toBe("Info: Info.");
      await userEvent.keyboard("{Escape}");
      expect((await shown())[0]).toBe("Danger: Danger 4.");
    });
  });

  describe("its clock", () => {
    test("closes it after 5 seconds", async () => {
      const screen = await renderIn("light", Toaster, {});
      toast("info", "ZID_CTR is open.");
      const item = screen.getByRole("listitem");
      await expect.element(item).toBeInTheDocument();
      vi.advanceTimersByTime(4900);
      await tick();
      await expect.element(item).toBeInTheDocument();
      vi.advanceTimersByTime(100);
      await expect.element(item).not.toBeInTheDocument();
    });

    test("stops while the pointer is on the toasts", async () => {
      const screen = await renderIn("light", Toaster, {});
      toast("info", "ZID_CTR is open.");
      const item = screen.getByRole("listitem");
      await userEvent.hover(item);
      vi.advanceTimersByTime(10_000);
      await tick();
      await expect.element(item).toBeInTheDocument();
      await userEvent.unhover(item);
      vi.advanceTimersByTime(5000);
      await expect.element(item).not.toBeInTheDocument();
    });

    test("stops while focus is on the toasts", async () => {
      const screen = await renderIn("light", Toaster, {});
      toast("info", "ZID_CTR is open.");
      const close = screen.getByRole("button", {
        name: "Dismiss ZID_CTR is open.",
      });
      await userEvent.tab();
      await expect.element(close).toHaveFocus();
      vi.advanceTimersByTime(10_000);
      await tick();
      await expect.element(close).toBeInTheDocument();
      (close.element() as HTMLElement).blur();
      vi.advanceTimersByTime(5000);
      await expect.element(close).not.toBeInTheDocument();
    });
  });
});
