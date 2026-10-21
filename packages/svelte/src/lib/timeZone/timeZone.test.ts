import { hydrate, tick, unmount } from "svelte";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { commands } from "vitest/browser";
import { savedTimeZone } from "../../../test/cookies.ts";
import { forgetTimeZone } from "../../playground/forgetTimeZone.ts";
import { COOKIE_NAME, type TimeZoneChoice } from "./timeZone.ts";
import Layout from "./TimeZoneLayout.test.svelte";

// The device is in Indianapolis; 2300Z on 20 October 2026 is 7:00 PM EDT
// there and 6:00 PM CDT in Chicago.
const INDY = "America/Indiana/Indianapolis";
const PATH = "/src/lib/timeZone/TimeZoneLayout.test.svelte";

beforeEach(() => commands.emulateTimeZone(INDY));

afterEach(async () => {
  forgetTimeZone();
  await commands.emulateTimeZone(null);
  for (const app of hydrated.splice(0)) unmount(app);
  document.querySelectorAll("[data-served]").forEach((el) => el.remove());
});

/** The text of the `Time` with `zone`. */
function shown(target: Element, zone = "local") {
  return target.querySelector(`[data-zone="${zone}"]`)?.textContent;
}

const hydrated: Record<string, unknown>[] = [];

/** Renders the layout on the server, then hydrates it, as SvelteKit would. */
async function serveAndHydrate(props: Record<string, unknown>) {
  const target = document.createElement("main");
  target.dataset.served = "";
  target.innerHTML = await commands.serverRender(PATH, props);
  document.body.append(target);
  const served = target.cloneNode(true) as HTMLElement;
  hydrated.push(hydrate(Layout, { target, props: props as never }));
  await tick();
  return { served, target };
}

describe("times drawn from the saved choice", () => {
  beforeAll(() => commands.serverRender(PATH, {}), 60_000);

  test("a saved zone is drawn by the server, and kept in the browser", async () => {
    const choice: TimeZoneChoice = { kind: "zone", zone: "America/Chicago" };
    const { served, target } = await serveAndHydrate({ choice });
    expect(shown(served)).toBe("6:00 PM CDT");
    expect(shown(target)).toBe("6:00 PM CDT");
  });

  test("Zulu is drawn by the server and kept, with Zulu alone where both are asked for", async () => {
    const { served, target } = await serveAndHydrate({
      choice: { kind: "zulu" },
      zones: ["local", "both"],
    });
    expect(shown(served)).toBe("2300Z");
    expect(shown(target)).toBe("2300Z");
    expect(shown(target, "both")).toBe("2300Z");
  });

  test("following the device, the server draws the zone last seen, and the browser where the device is now, and saves it", async () => {
    const { served, target } = await serveAndHydrate({
      choice: { kind: "device", zone: "America/Chicago" },
    });
    expect(shown(served)).toBe("6:00 PM CDT");
    await expect.poll(() => shown(target)).toBe("7:00 PM EDT");
    expect(savedTimeZone()).toEqual({
      kind: "device",
      zone: expect.stringMatching(/Indianapolis$/),
    });
  });

  test("with nothing saved, the server draws Zulu, the browser the device's zone, and nothing is saved", async () => {
    const { served, target } = await serveAndHydrate({});
    expect(shown(served)).toBe("2300Z");
    await expect.poll(() => shown(target)).toBe("7:00 PM EDT");
    expect(document.cookie).not.toContain(COOKIE_NAME);
  });
});
