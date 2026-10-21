import { afterEach, describe, expect, test, vi } from "vitest";
import { pinClockInIndianapolis } from "../../../test/clock.ts";
import { savedTimeZone as saved } from "../../../test/cookies.ts";
import { renderIn } from "../../../test/schemes.ts";
import { forgetTimeZone } from "../../playground/forgetTimeZone.ts";
import type { TimeZoneChoice } from "../timeZone/timeZone.ts";
import Layout from "../timeZone/TimeZoneLayout.test.svelte";
import TimeZoneSetting from "./TimeZoneSetting.svelte";

// The device is in Indianapolis; 2300Z on 20 October 2026 is 7:00 PM EDT
// there and 6:00 PM CDT in Chicago.
pinClockInIndianapolis();
afterEach(forgetTimeZone);

function setting(
  props: {
    choice?: TimeZoneChoice;
    saveToProfile?: (setting: string) => unknown;
  } = {},
) {
  return renderIn("light", Layout, { ...props, controls: true });
}

const ZULU = "Zulu";
const DEVICE = "Use my device's time zone";
const ANOTHER = "Another time zone";

// The rows' and the note's looks are preferenceControl's (its own tests).
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
    // A toggle, not a disclosure too: the picker shows while it's pressed.
    await expect.element(another).toHaveAttribute("aria-pressed", "false");
    expect(another.element().hasAttribute("aria-expanded")).toBe(false);
    await expect
      .element(
        screen.getByRole("combobox", {
          name: "Pick a time zone",
          includeHidden: true,
        }),
      )
      .not.toBeVisible();

    await another.click();
    await expect.element(another).toHaveAttribute("aria-pressed", "true");
    await expect
      .element(screen.getByRole("button", { name: DEVICE }))
      .toHaveAttribute("aria-pressed", "false");
    await expect.element(picker).toHaveFocus();
    expect(another.element().hasAttribute("aria-expanded")).toBe(false);

    await picker.selectOptions("America/Chicago");

    await expect.element(another).toHaveAttribute("aria-pressed", "true");
    await expect.element(another).toHaveAccessibleDescription("Chicago (CDT)");
    await expect.element(screen.getByText("6:00 PM CDT")).toBeInTheDocument();
    expect(saved()).toEqual({ kind: "zone", zone: "America/Chicago" });
    await expect
      .poll(() => saveToProfile.mock.calls)
      .toEqual([["America/Chicago"]]);
  });

  test("a picker opened in one control closes when another saves a choice", async () => {
    const screen = await renderIn("light", Layout, { controls: 2 });
    const [anotherHere] = screen.getByRole("button", { name: ANOTHER }).all();
    const [, zuluThere] = screen
      .getByRole("button", { name: ZULU, exact: true })
      .all();
    await anotherHere.click();
    await expect.element(anotherHere).toHaveAttribute("aria-pressed", "true");

    await zuluThere.click();
    await expect.element(anotherHere).toHaveAttribute("aria-pressed", "false");
    const [zuluHere] = screen
      .getByRole("button", { name: ZULU, exact: true })
      .all();
    await expect.element(zuluHere).toHaveAttribute("aria-pressed", "true");
    expect(
      screen
        .getByRole("combobox", {
          name: "Pick a time zone",
          includeHidden: true,
        })
        .all()
        .map((picker) => picker.element().checkVisibility()),
    ).toEqual([false, false]);
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

  test.each([
    [
      "mentions the profile when signed in",
      () => {},
      "Saved on this browser for a year, across flyindycenter.com, and to your Indy Center profile for every browser you sign in on.",
    ],
    [
      "leaves the profile out when nobody is signed in",
      undefined,
      "Saved on this browser for a year, across flyindycenter.com.",
    ],
  ])("What's saved? %s", async (_, saveToProfile, note) => {
    const screen = await setting({ saveToProfile });
    await screen.getByRole("button", { name: "What's saved?" }).click();
    await expect
      .element(screen.getByText(/^Saved on this browser/))
      .toHaveTextContent(note);
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
