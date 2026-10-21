import { hydrate, tick, unmount } from "svelte";
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
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn, type Scheme } from "../../../test/schemes.ts";
import { forgetTimeZone } from "../../playground/forgetTimeZone.ts";
import { readTimeZone, type TimeZoneChoice } from "../timeZone/timeZone.ts";
import Layout from "../timeZone/TimeZoneLayout.test.svelte";
import TimeZoneLine from "./TimeZoneLine.svelte";

// The device is in Indianapolis; 2300Z on 20 October 2026 is 7:00 PM EDT
// there and 6:00 PM CDT in Chicago.
const INDY = "America/Indiana/Indianapolis";
const NOW = new Date("2026-10-20T21:00:00Z");
const PATH = "/src/lib/timeZone/TimeZoneLayout.test.svelte";

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"], shouldAdvanceTime: true });
  vi.setSystemTime(NOW);
  await commands.emulateTimeZone(INDY);
});

afterEach(async () => {
  vi.useRealTimers();
  forgetTimeZone();
  await commands.emulateTimeZone(null);
});

function saved() {
  return readTimeZone({
    get: (name) =>
      document.cookie
        .split("; ")
        .find((pair) => pair.startsWith(`${name}=`))
        ?.slice(name.length + 1),
  });
}

function line(
  props: {
    choice?: TimeZoneChoice;
    saveToProfile?: (setting: string) => unknown;
  } = {},
  scheme: Scheme = "light",
) {
  return renderIn(scheme, Layout, { ...props, line: true });
}

/** The line's text, spaces collapsed. */
function textOf(element: Element | null) {
  return element?.textContent?.replace(/\s+/g, " ").trim();
}

describe("TimeZoneLine", () => {
  test("names the zone times are in, and offers Zulu", async () => {
    const screen = await line({
      choice: { kind: "zone", zone: "America/Chicago" },
    });
    const zulu = screen.getByRole("button", { name: "Show times in Zulu" });
    await expect.element(zulu).toBeInTheDocument();
    expect(textOf(zulu.element().closest("p"))).toBe(
      "Times in Chicago time (CDT) · Show times in Zulu",
    );
  });

  test("Show times in Zulu saves Zulu, applies it at once and sends it to the profile", async () => {
    const saveToProfile = vi.fn();
    const screen = await line({
      choice: { kind: "zone", zone: "America/Chicago" },
      saveToProfile,
    });
    await expect.element(screen.getByText("6:00 PM CDT")).toBeInTheDocument();

    await screen.getByRole("button", { name: "Show times in Zulu" }).click();

    await expect.element(screen.getByText("2300Z")).toBeInTheDocument();
    expect(saved()).toEqual({ kind: "zulu" });
    await expect.poll(() => saveToProfile.mock.calls).toEqual([["zulu"]]);
  });

  test("in Zulu, offers the device's zone, which follows the device", async () => {
    const saveToProfile = vi.fn();
    const screen = await line({ choice: { kind: "zulu" }, saveToProfile });
    const offer = screen.getByRole("button", {
      name: "Show them in Indianapolis time?",
    });
    await expect.element(offer).toBeInTheDocument();
    expect(textOf(offer.element().closest("p"))).toBe(
      "Times are in Zulu · Show them in Indianapolis time?",
    );

    await offer.click();

    await expect.element(screen.getByText("7:00 PM EDT")).toBeInTheDocument();
    expect(saved()).toEqual({
      kind: "device",
      zone: expect.stringMatching(/Indianapolis$/),
    });
    await expect.poll(() => saveToProfile.mock.calls).toEqual([["device"]]);
  });

  test("with nothing saved, names the device's zone and saves nothing", async () => {
    const screen = await line();
    await expect
      .element(screen.getByRole("button", { name: "Show times in Zulu" }))
      .toBeInTheDocument();
    expect(textOf(screen.container.querySelector("p"))).toBe(
      "Times in Indianapolis time (EDT) · Show times in Zulu",
    );
    expect(saved()).toBeUndefined();
  });

  test.each(SCHEMES)("its colours follow the roles (%s)", async (scheme) => {
    const screen = await line({ choice: { kind: "zulu" } }, scheme);
    const offer = screen.getByRole("button", { name: /^Show them in/ });
    await expect.element(offer).toHaveStyle({ color: role("link", scheme) });
    await expect
      .element(offer.element().closest("p"))
      .toHaveStyle({ color: role("muted-foreground", scheme) });
  });

  test("adds a caller's class and attributes to the line", async () => {
    const screen = await renderIn("light", TimeZoneLine, {
      class: "ml-4",
      id: "times",
    });
    const p = screen.container.querySelector("p");
    await expect.element(p).toHaveAttribute("id", "times");
    await expect.element(p).toHaveStyle({ marginLeft: "16px" });
  });

  describe("on the server", () => {
    const hydrated: Record<string, unknown>[] = [];
    afterEach(() => {
      for (const app of hydrated.splice(0)) unmount(app);
      document.querySelectorAll("[data-served]").forEach((el) => el.remove());
    });

    beforeAll(() => commands.serverRender(PATH, { line: true }), 60_000);

    test("with nothing saved, says Zulu until the browser knows the device's zone", async () => {
      const props = { line: true };
      const target = document.createElement("main");
      target.dataset.served = "";
      target.innerHTML = await commands.serverRender(PATH, props);
      expect(textOf(target.querySelector("p"))).toBe("Times are in Zulu");
      document.body.append(target);
      hydrated.push(hydrate(Layout, { target, props }));
      await tick();
      await expect
        .poll(() => textOf(target.querySelector("p")))
        .toBe("Times in Indianapolis time (EDT) · Show times in Zulu");
    });
  });
});
