import { hydrate, tick, unmount, type ComponentProps } from "svelte";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { commands } from "vitest/browser";
import { renderIn } from "../../../test/schemes.ts";
import Time from "./Time.svelte";

// Pinned clock: 2100Z on Tuesday 20 October 2026, 5:00 PM in Indianapolis
// (EDT, UTC−4).
const NOW = new Date("2026-10-20T21:00:00Z");
const INDY = "America/Indiana/Indianapolis";

beforeEach(async () => {
  // Only the date is faked, and it keeps moving: expect.element times its
  // retries by it.
  vi.useFakeTimers({ toFake: ["Date"], shouldAdvanceTime: true });
  vi.setSystemTime(NOW);
  await commands.emulateTimeZone(INDY);
});

afterEach(async () => {
  vi.useRealTimers();
  await commands.emulateTimeZone(null);
});

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

  describe("zone", () => {
    test("is the browser's local time by default", async () => {
      expect(await shown({ value: "2026-10-20T23:00:00Z" })).toBe(
        "7:00 PM EDT",
      );
    });

    test('"both" puts Zulu after local', async () => {
      expect(await shown({ value: "2026-10-20T23:00:00Z", zone: "both" })).toBe(
        "7:00 PM EDT · 2300Z",
      );
    });

    test('"zulu" stays in Zulu in the browser', async () => {
      expect(await shown({ value: "2026-10-20T23:00:00Z", zone: "zulu" })).toBe(
        "2300Z",
      );
    });
  });

  describe("with the date", () => {
    test('says "Today" for today', async () => {
      expect(
        await shown({ value: "2026-10-20T23:00:00Z", show: "datetime" }),
      ).toBe("Today, 7:00 PM EDT");
    });

    test("takes the day in the member's zone, not Zulu's", async () => {
      // 0200Z on the 21st is still the 20th in Indianapolis.
      expect(
        await shown({ value: "2026-10-21T02:00:00Z", show: "datetime" }),
      ).toBe("Today, 10:00 PM EDT");
    });

    test('says "Tomorrow" for tomorrow', async () => {
      expect(
        await shown({ value: "2026-10-21T23:00:00Z", show: "datetime" }),
      ).toBe("Tomorrow, 7:00 PM EDT");
    });

    test("names the weekday within the coming week", async () => {
      expect(
        await shown({ value: "2026-10-22T23:00:00Z", show: "datetime" }),
      ).toBe("Thursday, 7:00 PM EDT");
      expect(
        await shown({ value: "2026-10-26T23:00:00Z", show: "datetime" }),
      ).toBe("Monday, 7:00 PM EDT");
    });

    test("puts the day before the month from a week out", async () => {
      expect(
        await shown({ value: "2026-10-27T23:00:00Z", show: "datetime" }),
      ).toBe("Tue 27 Oct, 7:00 PM EDT");
    });

    test("puts the day before the month for a day gone by", async () => {
      expect(
        await shown({ value: "2026-10-19T23:00:00Z", show: "datetime" }),
      ).toBe("Mon 19 Oct, 7:00 PM EDT");
    });

    test("adds the year when it isn't this year", async () => {
      expect(
        await shown({ value: "2027-03-04T23:00:00Z", show: "datetime" }),
      ).toBe("Thu 4 Mar 2027, 6:00 PM EST");
    });
  });

  describe("a range", () => {
    const event = {
      value: "2026-10-20T23:00:00Z",
      end: "2026-10-21T02:00:00Z",
      show: "datetime",
      zone: "both",
    } as const;

    test("shares the day and the zone between its ends", async () => {
      expect(await shown(event)).toBe(
        "Today, 7:00 PM–10:00 PM EDT · 2300Z–0200Z",
      );
    });

    test("marks each end with its own datetime", async () => {
      const screen = await renderIn("light", Time, event);
      await tick();
      const times = [...screen.container.querySelectorAll("time")];
      expect(times.map((t) => [t.dateTime, t.textContent])).toEqual([
        ["2026-10-20T23:00:00.000Z", "Today, 7:00 PM"],
        ["2026-10-21T02:00:00.000Z", "10:00 PM EDT"],
        ["2026-10-20T23:00:00.000Z", "2300Z"],
        ["2026-10-21T02:00:00.000Z", "0200Z"],
      ]);
    });

    test("names the end's day when it ends on another", async () => {
      expect(await shown({ ...event, end: "2026-10-21T05:00:00Z" })).toBe(
        "Today, 7:00 PM–Tomorrow, 1:00 AM EDT · 2300Z–0500Z",
      );
    });
  });

  describe("relative", () => {
    test('says "in" before a time to come, in short units', async () => {
      expect(
        await shown({ value: "2026-10-20T23:00:00Z", show: "relative" }),
      ).toBe("in 2 h");
    });

    test("gives a time gone by as a bare length, for the caller to label", async () => {
      expect(
        await shown({ value: "2026-10-20T19:37:00Z", show: "relative" }),
      ).toBe("1 h 23 m");
    });

    test("keeps the instant as its datetime", async () => {
      const screen = await renderIn("light", Time, {
        value: "2026-10-20T19:37:00Z",
        show: "relative",
      });
      await expect
        .element(screen.container.querySelector("time"))
        .toHaveAttribute("datetime", "2026-10-20T19:37:00.000Z");
    });

    test("counts on as the minutes pass", async () => {
      vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval"] });
      vi.setSystemTime(NOW);
      const screen = await renderIn("light", Time, {
        value: "2026-10-20T19:37:00Z",
        show: "relative",
      });
      await tick();
      vi.advanceTimersByTime(60_000);
      await tick();
      expect(screen.container.textContent).toBe("1 h 24 m");
    });
  });

  describe("on the server", () => {
    // The first server render compiles the component: give it time once.
    beforeAll(() => commands.serverRender(PATH, { value: 0 }), 60_000);

    // The server can't know the member's zone, so it draws Zulu, whatever
    // zone the server itself runs in.
    test("draws the time in Zulu", async () => {
      const html = await commands.serverRender(PATH, {
        value: "2026-10-20T23:00:00Z",
      });
      expect(text(html)).toBe("2300Z");
      expect(html).toContain('datetime="2026-10-20T23:00:00.000Z"');
    });

    test("switches to the browser's zone once hydrated", async () => {
      const time = await serveAndHydrate({ value: "2026-10-20T23:00:00Z" });
      await expect.poll(() => time.textContent).toBe("7:00 PM EDT");
    });

    test("follows whichever zone the browser is in", async () => {
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

/** The text a server-rendered fragment shows. */
function text(html: string): string {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent ?? "";
}
