import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import { role } from "../../../test/roles.ts";
import { renderIn, type Scheme } from "../../../test/schemes.ts";
import { forgetTimeZone } from "../../playground/forgetTimeZone.ts";
import { readTimeZone, type TimeZoneChoice } from "../timeZone/timeZone.ts";
import Layout from "../timeZone/TimeZoneLayout.test.svelte";
import TimeZoneSetting from "./TimeZoneSetting.svelte";

// The device is in Indianapolis; 2300Z on 20 October 2026 is 7:00 PM EDT
// there and 6:00 PM CDT in Chicago.
const INDY = "America/Indiana/Indianapolis";
const NOW = new Date("2026-10-20T21:00:00Z");

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

/** The choice the page's next request would carry. */
function saved() {
  return readTimeZone({
    get: (name) =>
      document.cookie
        .split("; ")
        .find((pair) => pair.startsWith(`${name}=`))
        ?.slice(name.length + 1),
  });
}

function setting(
  props: {
    choice?: TimeZoneChoice;
    saveToProfile?: (setting: string) => unknown;
  } = {},
  scheme: Scheme = "light",
) {
  return renderIn(scheme, Layout, { ...props, controls: true });
}

const ZULU = "Zulu";
const DEVICE = "Use my device's time zone";
const ANOTHER = "Another time zone";

describe("TimeZoneSetting", () => {
  test("is a group of three choices, named Time zone", async () => {
    const screen = await setting();
    const group = screen.getByRole("group", { name: "Time zone" });
    for (const name of [ZULU, DEVICE, ANOTHER]) {
      await expect
        .element(group.getByRole("button", { name, exact: true }))
        .toBeInTheDocument();
    }
  });

  test("with nothing saved, the device's zone is ticked, with its city and abbreviation", async () => {
    const screen = await setting();
    const device = screen.getByRole("button", { name: DEVICE });
    await expect.element(device).toHaveAttribute("aria-pressed", "true");
    await expect
      .element(device)
      .toHaveAccessibleDescription("Indianapolis (EDT)");
    await expect
      .element(screen.getByRole("button", { name: ZULU }))
      .toHaveAttribute("aria-pressed", "false");
    expect(saved()).toBeUndefined();
  });

  test("Zulu is saved, applied to every time at once, and sent to the profile", async () => {
    const saveToProfile = vi.fn();
    const screen = await setting({ saveToProfile });
    await expect.element(screen.getByText("7:00 PM EDT")).toBeInTheDocument();

    await screen.getByRole("button", { name: ZULU }).click();

    await expect
      .element(screen.getByRole("button", { name: ZULU }))
      .toHaveAttribute("aria-pressed", "true");
    await expect.element(screen.getByText("2300Z")).toBeInTheDocument();
    expect(saved()).toEqual({ kind: "zulu" });
    await expect.poll(() => saveToProfile.mock.calls).toEqual([["zulu"]]);
  });

  test("following the device saves its zone, and device to the profile", async () => {
    const saveToProfile = vi.fn();
    const screen = await setting({ choice: { kind: "zulu" }, saveToProfile });

    await screen.getByRole("button", { name: DEVICE }).click();

    await expect.element(screen.getByText("7:00 PM EDT")).toBeInTheDocument();
    expect(saved()).toEqual({
      kind: "device",
      zone: expect.stringMatching(/Indianapolis$/),
    });
    await expect.poll(() => saveToProfile.mock.calls).toEqual([["device"]]);
  });

  test("another time zone opens a picker, and the zone picked is saved", async () => {
    const saveToProfile = vi.fn();
    const screen = await setting({ saveToProfile });
    const another = screen.getByRole("button", { name: ANOTHER });
    const picker = screen.getByRole("combobox", { name: "Pick a time zone" });
    await expect.element(another).toHaveAttribute("aria-expanded", "false");
    await expect
      .element(
        screen.getByRole("combobox", {
          name: "Pick a time zone",
          includeHidden: true,
        }),
      )
      .not.toBeVisible();

    await another.click();
    await expect.element(another).toHaveAttribute("aria-expanded", "true");
    await expect.element(picker).toHaveFocus();

    await picker.selectOptions("America/Chicago");

    await expect.element(another).toHaveAttribute("aria-pressed", "true");
    await expect.element(another).toHaveAccessibleDescription("Chicago (CDT)");
    await expect.element(screen.getByText("6:00 PM CDT")).toBeInTheDocument();
    expect(saved()).toEqual({ kind: "zone", zone: "America/Chicago" });
    await expect
      .poll(() => saveToProfile.mock.calls)
      .toEqual([["America/Chicago"]]);
  });

  test("a saved zone is ticked, its picker open on it", async () => {
    const screen = await setting({
      choice: { kind: "zone", zone: "Europe/London" },
    });
    await expect
      .element(screen.getByRole("button", { name: ANOTHER }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(screen.getByRole("combobox", { name: "Pick a time zone" }))
      .toHaveValue("Europe/London");
  });

  test("the picker groups zones by region, named by city", async () => {
    const screen = await setting();
    await screen.getByRole("button", { name: ANOTHER }).click();
    const chicago = screen.getByRole("option", { name: "Chicago (CDT)" });
    await expect.element(chicago).toHaveValue("America/Chicago");
    expect(chicago.element().closest("optgroup")?.label).toBe("America");
  });

  test("works from the keyboard", async () => {
    const screen = await setting();
    await userEvent.tab();
    await expect
      .element(screen.getByRole("button", { name: ZULU }))
      .toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(saved()).toEqual({ kind: "zulu" });
  });

  describe("What's saved?", () => {
    test("shows the note, mentioning the profile when signed in", async () => {
      const screen = await setting({ saveToProfile: () => {} });
      const button = screen.getByRole("button", { name: "What's saved?" });
      const note = screen.getByText(/^Saved on this browser/);
      await expect.element(button).toHaveAttribute("aria-expanded", "false");
      await expect.element(note).not.toBeVisible();
      await button.click();
      await expect.element(button).toHaveAttribute("aria-expanded", "true");
      await expect
        .element(note)
        .toHaveTextContent(
          "Saved on this browser for a year, across flyindycenter.com, and to your Indy Center profile for every browser you sign in on.",
        );
    });

    test("leaves the profile out when nobody is signed in", async () => {
      const screen = await setting();
      await screen.getByRole("button", { name: "What's saved?" }).click();
      await expect
        .element(screen.getByText(/^Saved on this browser/))
        .toHaveTextContent(
          "Saved on this browser for a year, across flyindycenter.com.",
        );
    });
  });

  test.each(SCHEMES)("its colours follow the roles (%s)", async (scheme) => {
    const screen = await setting({ choice: { kind: "zulu" } }, scheme);
    await expect
      .element(screen.getByRole("button", { name: ZULU }))
      .toHaveStyle({
        color: role("foreground", scheme),
        backgroundColor: role("muted", scheme),
      });
    await expect
      .element(screen.getByRole("button", { name: DEVICE }))
      .toHaveStyle({ color: role("foreground-soft", scheme) });
  });

  test("every row is at least 44px tall", async () => {
    const screen = await setting();
    for (const name of [ZULU, DEVICE, ANOTHER, "What's saved?"]) {
      const box = screen
        .getByRole("button", { name, exact: true })
        .element()
        .getBoundingClientRect();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test("adds a caller's class and attributes to the group", async () => {
    const screen = await renderIn("light", TimeZoneSetting, {
      class: "ml-4",
      id: "zone",
    });
    const group = screen.getByRole("group", { name: "Time zone" });
    await expect.element(group).toHaveAttribute("id", "zone");
    await expect.element(group).toHaveStyle({ marginLeft: "16px" });
  });
});
