import { hydrate, tick, unmount, type ComponentProps } from "svelte";
import { afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { commands } from "vitest/browser";
import { NOW, pinClockInIndianapolis } from "../../../test/clock.ts";
import { renderIn } from "../../../test/schemes.ts";
import Time from "./Time.svelte";

// The device is in Indianapolis, the clock at 2100Z on Tuesday 20 October
// 2026 (5:00 PM EDT).
pinClockInIndianapolis();

// The text for each prop is timeText's (format.node.test.ts); here, how Time
// draws it, where it takes the member's zone and clock from, and the server.
describe("Time", () => {
  test("is a <time> carrying the instant as its datetime", async () => {
    const screen = await renderIn("light", Time, {
      value: "2026-10-20T23:00:00Z",
    });
    const time = screen.container.querySelector("time");
    await expect
      .element(time)
      .toHaveAttribute("datetime", "2026-10-20T23:00:00.000Z");
  });

  test("adds a caller's class and attributes to its own", async () => {
    const screen = await renderIn("light", Time, {
      value: "2026-10-20T23:00:00Z",
      class: "ml-4",
      id: "start",
    });
    const time = screen.container.querySelector("time");
    await expect.element(time).toHaveAttribute("id", "start");
    await expect.element(time).toHaveStyle({ marginLeft: "16px" });
  });

  test("puts a range's class and attributes on the whole range", async () => {
    const screen = await renderIn("light", Time, {
      value: "2026-10-20T23:00:00Z",
      end: "2026-10-21T02:00:00Z",
      class: "ml-4",
      id: "event",
    });
    const range = screen.container.querySelector<HTMLElement>("#event");
    await expect.element(range).toHaveStyle({ marginLeft: "16px" });
    expect(range?.querySelectorAll("time")).toHaveLength(2);
  });

  describe("given something that isn't a date", () => {
    test("shows nothing, and warns", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const screen = await renderIn("light", Time, { value: "soon" });
      await tick();
      expect(screen.container.innerHTML.replace(/<!---->/g, "")).toBe("");
      expect(warn).toHaveBeenCalledWith("Time: value is not a date:", "soon");
      warn.mockRestore();
    });

    test("leaves off a range's end", async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(await shown({ value: "2026-10-20T23:00:00Z", end: "later" })).toBe(
        "7:00 PM EDT",
      );
      expect(warn).toHaveBeenCalledWith("Time: end is not a date:", "later");
      warn.mockRestore();
    });
  });

  test("is the device's local time by default", async () => {
    expect(await shown({ value: "2026-10-20T23:00:00Z" })).toBe("7:00 PM EDT");
  });

  test("takes milliseconds since the epoch, and a Date", async () => {
    const at = Date.UTC(2026, 9, 20, 23);
    expect(await shown({ value: at })).toBe("7:00 PM EDT");
    expect(await shown({ value: new Date(at) })).toBe("7:00 PM EDT");
  });

  test("follows a new value", async () => {
    const screen = await renderIn("light", Time, {
      value: "2026-10-20T23:00:00Z",
    });
    await tick();
    await screen.rerender({ value: "2026-10-21T00:30:00Z" });
    const time = screen.container.querySelector("time");
    expect(time?.textContent).toBe("8:30 PM EDT");
    expect(time?.dateTime).toBe("2026-10-21T00:30:00.000Z");
  });

  test("moves on a day at the member's midnight", async () => {
    // 11:59 PM EDT on the 20th.
    useFakeClock("2026-10-21T03:59:00Z");
    const screen = await renderIn("light", Time, {
      value: "2026-10-21T23:00:00Z",
      show: "datetime",
    });
    await tick();
    expect(screen.container.textContent).toBe("Tomorrow, 7:00 PM EDT");
    vi.advanceTimersByTime(60_000);
    await tick();
    expect(screen.container.textContent).toBe("Today, 7:00 PM EDT");
  });

  test("marks each end of a range with its own datetime", async () => {
    const screen = await renderIn("light", Time, {
      value: "2026-10-20T23:00:00Z",
      end: "2026-10-21T02:00:00Z",
      show: "datetime",
      zone: "both",
    });
    await tick();
    const times = [...screen.container.querySelectorAll("time")];
    expect(times.map((t) => [t.dateTime, t.textContent])).toEqual([
      ["2026-10-20T23:00:00.000Z", "Today, 7:00 PM"],
      ["2026-10-21T02:00:00.000Z", "10:00 PM EDT"],
      ["2026-10-20T23:00:00.000Z", "2300Z"],
      ["2026-10-21T02:00:00.000Z", "0200Z"],
    ]);
  });

  describe("relative", () => {
    test("counts on as the minutes pass", async () => {
      useFakeClock(NOW);
      const screen = await renderIn("light", Time, {
        value: "2026-10-20T19:37:00Z",
        show: "relative",
      });
      await tick();
      vi.advanceTimersByTime(60_000);
      await tick();
      expect(screen.container.textContent).toBe("1 h 24 m");
    });

    test("counts on when it becomes relative after mounting", async () => {
      useFakeClock(NOW);
      const screen = await renderIn("light", Time, {
        value: "2026-10-20T19:37:00Z",
      });
      await tick();
      await screen.rerender({ show: "relative" });
      vi.advanceTimersByTime(60_000);
      await tick();
      expect(screen.container.textContent).toBe("1 h 24 m");
    });
  });

  // The server can't know the member's zone, so it draws Zulu, whatever
  // zone the server itself runs in. A served time switching to a saved
  // zone, or the device's, is timeZone.test.ts's.
  describe("on the server", () => {
    // The first server render compiles the component: give it time once.
    beforeAll(() => commands.serverRender(PATH, { value: 0 }), 60_000);

    test("writes a range's dates in Zulu, then the member's day", async () => {
      // An earlier year, so the served text keeps it whenever this runs.
      const props = {
        value: "2025-03-04T23:00:00Z",
        end: "2025-03-05T02:00:00Z",
        show: "datetime",
        zone: "both",
      };
      const target = await serve(props);
      expect(target.textContent).toBe(
        "Tue 4 Mar 2025, 2300Z–Wed 5 Mar 2025, 0200Z",
      );
      hydrateServed(target, props);
      await expect
        .poll(() => target.textContent)
        .toBe("Tue 4 Mar 2025, 6:00 PM–9:00 PM EST · 2300Z–0200Z");
    });

    test("follows whichever zone the browser is in once hydrated", async () => {
      await commands.emulateTimeZone("Europe/London");
      const time = await serveAndHydrate({ value: "2026-10-20T23:00:00Z" });
      await expect.poll(() => time.textContent).toBe("12:00 AM GMT+1");
    });

    test("brings a relative time up to date once hydrated", async () => {
      // The server keeps real time; the page hydrates two minutes after it
      // drew the page.
      const served = vi.getRealSystemTime();
      const props = {
        value: new Date(served - 83 * 60_000).toISOString(),
        show: "relative",
      };
      const target = await serve(props);
      expect(target.textContent).toBe("1 h 23 m");
      vi.setSystemTime(served + 120_000);
      hydrateServed(target, props);
      await expect.poll(() => target.textContent).toBe("1 h 25 m");
    });
  });
});

/** Fakes the clock and its timers at `at`, moving only when a test says. */
function useFakeClock(at: Date | string) {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(at);
}

/** The text `Time` shows in the browser, once it has switched to local. */
async function shown(props: ComponentProps<typeof Time>): Promise<string> {
  const screen = await renderIn("light", Time, props);
  // Mounting is when it leaves Zulu; let that finish before reading.
  await tick();
  return screen.container.textContent ?? "";
}

const PATH = "/src/lib/Time/Time.svelte";
const hydrated: Record<string, unknown>[] = [];

afterEach(() => {
  for (const app of hydrated.splice(0)) unmount(app);
  document.querySelectorAll("[data-served]").forEach((el) => el.remove());
});

/** Renders `Time` on the server and puts the HTML on the page. */
async function serve(props: Record<string, unknown>) {
  const target = document.createElement("main");
  target.dataset.served = "";
  target.innerHTML = await commands.serverRender(PATH, props);
  document.body.append(target);
  return target;
}

/** Hydrates served HTML in `target`, as SvelteKit would. */
function hydrateServed(target: HTMLElement, props: Record<string, unknown>) {
  hydrated.push(hydrate(Time, { target, props: props as never }));
}

/** Serves `Time`, hydrates it, and returns its `<time>`. */
async function serveAndHydrate(props: Record<string, unknown>) {
  const target = await serve(props);
  hydrateServed(target, props);
  const time = target.querySelector("time");
  if (!time) throw new Error("No <time> was served");
  return time;
}
