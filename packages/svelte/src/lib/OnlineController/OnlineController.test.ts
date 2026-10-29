import type { ComponentProps } from "svelte";
import { describe, expect, test } from "vitest";
import { pinClockInIndianapolis } from "../../../test/clock.ts";
import { onScreen } from "../../../test/readOut.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import WithPositions from "../../../test/WithPositions.svelte";
import { samplePositions } from "../../playground/positions.ts";
import OnlineController from "./OnlineController.svelte";

// The device is in Indianapolis, the clock at 2100Z on Tuesday 20 October
// 2026 (5:00 PM EDT).
pinClockInIndianapolis();

// Position, Member and Time draw their own parts, and their tests hold
// their looks; here, what the row puts together.

const jordan = {
  name: "Jordan Sample",
  cid: 1000001,
  // 1 h 23 m before the pinned clock.
  loggedInAt: "2026-10-20T19:37:00Z",
};
const alex = {
  name: "Alex Example",
  cid: 1000002,
  loggedInAt: "2026-10-20T20:30:00Z",
};

/** Renders the row below a layout that set the sample positions. */
async function show(props: ComponentProps<typeof OnlineController>) {
  const screen = await renderIn("light", WithPositions, {
    positions: samplePositions,
    component: OnlineController,
    props,
  });
  const root = screen.container.firstElementChild as HTMLElement;
  return { screen, root };
}

/** The row's lines on screen after the position's. */
function linesAfterPosition(root: HTMLElement): string[] {
  return [...root.children]
    .slice(1)
    .flatMap((member) => [...member.children].map((line) => onScreen(line)));
}

describe("OnlineController", () => {
  test("shows the position, then who's on and for how long, with no CID", async () => {
    const { root } = await show({ callsign: "IND_83_CTR", members: [jordan] });
    expect(onScreen(root)).toBe(
      "Indy Center 128.22 FLM 83 · Falmouth 83 Jordan Sample · 1 h 23 m",
    );
  });

  test("shows the CID when asked", async () => {
    const { root } = await show({
      callsign: "IND_83_CTR",
      members: [jordan],
      showCid: true,
    });
    expect(linesAfterPosition(root)).toEqual([
      "Jordan Sample · CID 1000001 · 1 h 23 m",
    ]);
  });

  test("marks the time on up as the log-in it counts from", async () => {
    const { root } = await show({ callsign: "IND_83_CTR", members: [jordan] });
    const time = root.querySelector("time")!;
    expect(time.textContent).toBe("1 h 23 m");
    expect(time.getAttribute("datetime")).toBe("2026-10-20T19:37:00.000Z");
  });

  describe("the log-out line", () => {
    test("comes from the controller info, local then Zulu", async () => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        members: [{ ...jordan, info: "Indy Center.\nOff at 2330z" }],
      });
      expect(linesAfterPosition(root)).toEqual([
        "Jordan Sample · 1 h 23 m",
        "Online until 7:30 PM EDT · 2330Z",
      ]);
    });

    test("comes from the booking, which wins over the info", async () => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        members: [
          {
            ...jordan,
            info: "Off at 2330z",
            bookingEnd: "2026-10-21T01:00:00Z",
          },
        ],
      });
      expect(linesAfterPosition(root)).toEqual([
        "Jordan Sample · 1 h 23 m",
        "Online until 9:00 PM EDT · 0100Z",
      ]);
    });

    test("is left out when neither gives a time", async () => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        members: [{ ...jordan, info: "Runway 23 in use, ATIS on 128.82" }],
      });
      expect(linesAfterPosition(root)).toEqual(["Jordan Sample · 1 h 23 m"]);
    });

    test("is in muted-foreground", async () => {
      const { screen } = await show({
        callsign: "IND_83_CTR",
        members: [{ ...jordan, info: "Off at 2330z" }],
      });
      await expect
        .element(screen.getByText(/^Online until/))
        .toHaveStyle({ color: role("muted-foreground", "light") });
    });
  });

  test("stacks two people on one position beneath it, each with their own times", async () => {
    const { root } = await show({
      callsign: "IND_83_CTR",
      members: [{ ...jordan, info: "Off at 2330z" }, alex],
    });
    expect(onScreen(root.firstElementChild!)).toBe(
      "Indy Center 128.22 FLM 83 · Falmouth 83",
    );
    expect(linesAfterPosition(root)).toEqual([
      "Jordan Sample · 1 h 23 m",
      "Online until 7:30 PM EDT · 2330Z",
      "Alex Example · 30 m",
    ]);
    const [first, second] = [...root.children].slice(1);
    expect(second.getBoundingClientRect().top).toBeGreaterThan(
      first.getBoundingClientRect().bottom - 1,
    );
  });

  test("shows a relief login as the position it covers", async () => {
    const { root } = await show({ callsign: "IND_831_CTR", members: [jordan] });
    expect(onScreen(root.firstElementChild!)).toBe(
      "Indy Center 128.22 FLM 83 · Falmouth 83",
    );
  });

  test("shows no rating and nothing to open", async () => {
    const { screen, root } = await show({
      callsign: "IND_83_CTR",
      members: [jordan],
    });
    expect(root.querySelector("abbr")).toBeNull();
    expect(
      screen.container.querySelector("button, [aria-expanded]"),
    ).toBeNull();
  });

  test("links the name when given an href", async () => {
    const { screen } = await show({
      callsign: "IND_83_CTR",
      members: [{ ...jordan, href: "/roster/1000001" }],
    });
    await expect
      .element(screen.getByRole("link", { name: "Jordan Sample" }))
      .toHaveAttribute("href", "/roster/1000001");
  });

  test("adds a caller's class and attributes to its own", async () => {
    const { root } = await show({
      callsign: "IND_83_CTR",
      members: [jordan],
      class: "ml-4",
      id: "on",
    });
    expect(root.id).toBe("on");
    expect(getComputedStyle(root).marginLeft).toBe("16px");
  });
});
