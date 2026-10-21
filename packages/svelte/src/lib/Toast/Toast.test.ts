import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role, type Role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import type { Severity } from "../severity/severity.ts";
import Toaster from "./Toaster.svelte";
import { toast } from "./toast.svelte.ts";
import { toastFromServer, type ToastCookies } from "./toastFromServer.ts";

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

  describe("raised from the server", () => {
    // SvelteKit's cookies, as the browser ends up holding them: the value
    // URI-encoded, as Kit writes it.
    const cookies: ToastCookies = {
      get: (name) => {
        const pair = document.cookie
          .split("; ")
          .find((c) => c.startsWith(`${name}=`));
        return pair && decodeURIComponent(pair.slice(name.length + 1));
      },
      set: (name, value, { path, maxAge, sameSite }) => {
        document.cookie = `${name}=${encodeURIComponent(value)}; path=${path}; max-age=${maxAge}; samesite=${sameSite}`;
      },
    };
    const kept = () => document.cookie.includes("centerline-toasts=");
    afterEach(() => {
      document.cookie = "centerline-toasts=; path=/; max-age=0";
    });

    test("shows and reads, on the page it lands on, each toast a form action raised", async () => {
      toastFromServer(cookies, "success", "Roster saved.");
      toastFromServer(cookies, "info", "Emails go out tonight.");
      const screen = await renderIn("light", Toaster, {});
      await expect
        .element(screen.getByRole("listitem").first())
        .toHaveTextContent("Info: Emails go out tonight.");
      await expect
        .element(screen.getByRole("listitem").nth(1))
        .toHaveTextContent("Success: Roster saved.");
      await expect
        .element(screen.getByRole("status"))
        .toHaveTextContent(
          "Success: Roster saved.Info: Emails go out tonight.",
        );
      expect(kept()).toBe(false);
    });

    test("shows one that arrives without a new page, such as after use:enhance", async () => {
      const screen = await renderIn("light", Toaster, {});
      toastFromServer(cookies, "danger", "We couldn't save the roster.");
      vi.advanceTimersByTime(100);
      await expect
        .element(screen.getByRole("alert"))
        .toHaveTextContent("Danger: We couldn't save the roster.");
      expect(kept()).toBe(false);
    });

    test("tells the browser it may read the cookie, for a minute at most", () => {
      const set = vi.fn();
      toastFromServer({ get: () => undefined, set }, "success", "Saved.");
      expect(set).toHaveBeenCalledWith(
        "centerline-toasts",
        JSON.stringify([{ level: "success", message: "Saved." }]),
        { path: "/", httpOnly: false, maxAge: 60, sameSite: "lax" },
      );
    });

    test("leaves out a cookie that doesn't hold toasts", async () => {
      document.cookie = `centerline-toasts=${encodeURIComponent('[{"level":"purple","message":"Hi"},{"level":"info"}]')}; path=/`;
      await renderIn("light", Toaster, {});
      await tick();
      expect(notifications()).toBeNull();
      expect(kept()).toBe(false);
    });
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
  describe.each(SCHEMES)("in %s", (scheme) => {
    const levelRole: Record<Severity, Role> = {
      info: "info",
      success: "success",
      caution: "warning",
      danger: "destructive",
    };

    test.each(["info", "success", "caution", "danger"] as Severity[])(
      "%s is a card with its role's icon and rule",
      async (level) => {
        const screen = await renderIn(scheme, Toaster, {});
        toast(level, "Roster saved.");
        const item = screen.getByRole("listitem");
        const colour = role(levelRole[level], scheme);
        await expect.element(item).toHaveStyle({
          backgroundColor: role("card", scheme),
          borderLeftColor: colour,
          borderLeftWidth: "4px",
        });
        await expect
          .element(item.element().querySelector<SVGElement>("svg path"))
          .toHaveStyle({ fill: colour });
        await expect
          .element(item.element().querySelector("p")!)
          .toHaveStyle({ color: role("foreground-soft", scheme) });
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

    test("a waiting toast is read when it shows, not before", async () => {
      const screen = await renderIn("light", Toaster, {});
      for (const n of [1, 2, 3, 4]) toast("info", `Toast ${n}.`);
      const status = screen.getByRole("status");
      await expect
        .element(status)
        .toHaveTextContent("Info: Toast 1.Info: Toast 2.Info: Toast 3.");
      await userEvent.keyboard("{Escape}");
      await expect
        .element(status)
        .toHaveTextContent(
          "Info: Toast 1.Info: Toast 2.Info: Toast 3.Info: Toast 4.",
        );
    });

    test("a toast sent back to the queue isn't read again when it returns", async () => {
      const screen = await renderIn("light", Toaster, {});
      for (const n of [1, 2, 3]) toast("info", `Info ${n}.`);
      toast("danger", "Not saved.");
      await userEvent.keyboard("{Escape}");
      expect((await shown())[0]).toBe("Info: Info 1.");
      await expect
        .element(screen.getByRole("status"))
        .toHaveTextContent("Info: Info 1.Info: Info 2.Info: Info 3.");
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

    test("runs again after the pointer closes the last toast", async () => {
      const screen = await renderIn("light", Toaster, {});
      toast("info", "ZID_CTR is open.");
      await screen
        .getByRole("button", { name: "Dismiss ZID_CTR is open." })
        .click();
      await expect
        .element(screen.getByRole("listitem"))
        .not.toBeInTheDocument();
      // Somewhere the toasts never are.
      const elsewhere = document.createElement("p");
      elsewhere.textContent = "Elsewhere";
      elsewhere.style.cssText = "position: fixed; left: 0; bottom: 0";
      document.body.append(elsewhere);
      await userEvent.hover(elsewhere);

      toast("info", "Roster saved.");
      const item = screen.getByRole("listitem");
      await expect.element(item).toBeInTheDocument();
      vi.advanceTimersByTime(5000);
      await expect.element(item).not.toBeInTheDocument();
      elsewhere.remove();
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
