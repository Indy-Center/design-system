import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";
import { SCHEMES } from "../../../test/contrast.ts";
import EventStartField from "../../../test/EventStartField.svelte";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import DateTimeInput from "./DateTimeInput.svelte";

const PATH = "/src/lib/DateTimeInput/DateTimeInput.svelte";

// Pinned clock: 2100Z on Tuesday 20 October 2026, 5:00 PM in Indianapolis
// (EDT, UTC−4).
const NOW = new Date("2026-10-20T21:00:00Z");
const INDY = "America/Indiana/Indianapolis";

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ["Date"], shouldAdvanceTime: true });
  vi.setSystemTime(NOW);
  await commands.emulateTimeZone(INDY);
});

afterEach(async () => {
  vi.useRealTimers();
  await commands.emulateTimeZone(null);
});

describe("DateTimeInput", () => {
  test("turns the local time typed into UTC", async () => {
    const screen = await renderIn("light", EventStartField, {});
    await screen.getByLabelText("Start").fill("2026-10-20T19:00");
    await expect
      .element(screen.getByTestId("bound"))
      .toHaveTextContent("2026-10-20T23:00:00.000Z");
  });

  // 2:30 AM on 14 March 2027 doesn't happen in Indianapolis: the clocks
  // go from 2:00 EST to 3:00 EDT.
  test("moves a time the clocks skip on to where it lands", async () => {
    const screen = await renderIn("light", EventStartField, {});
    await screen.getByLabelText("Start").fill("2027-03-14T02:30");
    await expect
      .element(screen.getByTestId("bound"))
      .toHaveTextContent("2027-03-14T07:30:00.000Z");
    await expect
      .element(screen.getByLabelText("Start"))
      .toHaveValue("2027-03-14T03:30");
  });

  test("shows a UTC value in the member's local time", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-20T23:00:00Z",
    });
    await expect
      .element(screen.getByLabelText("Start"))
      .toHaveValue("2026-10-20T19:00");
  });

  test("reads the value back in local time and Zulu", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-27T23:00:00Z",
    });
    await expect
      .element(screen.getByText(/^Local/))
      .toHaveTextContent("Local: Tue 27 Oct, 7:00 PM EDT");
    await expect
      .element(screen.getByText(/^Zulu/))
      .toHaveTextContent("Zulu: Tue 27 Oct, 2300Z");
  });

  test("reads Zulu's own day where it differs from the member's", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-28T01:00:00Z",
    });
    await expect
      .element(screen.getByText(/^Local/))
      .toHaveTextContent("Local: Tue 27 Oct, 9:00 PM EDT");
    await expect
      .element(screen.getByText(/^Zulu/))
      .toHaveTextContent("Zulu: Wed 28 Oct, 0100Z");
  });

  test("reads back what is typed as it is typed", async () => {
    const screen = await renderIn("light", EventStartField, {});
    await screen.getByLabelText("Start").fill("2026-10-27T19:00");
    await expect
      .element(screen.getByText(/^Zulu/))
      .toHaveTextContent("Zulu: Tue 27 Oct, 2300Z");
  });

  test("names the member's zone while empty", async () => {
    const screen = await renderIn("light", EventStartField, {});
    // Chromium gives the zone's older, shorter name.
    await expect
      .element(screen.getByLabelText("Start"))
      .toHaveAccessibleDescription("In your time zone, America/Indianapolis.");
  });

  test("is described by its read-out, then the field's hint and error", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-27T23:00:00Z",
      hint: "When the event opens.",
      error: "Starts before the event is posted.",
    });
    await expect
      .element(screen.getByLabelText("Start"))
      .toHaveAccessibleDescription(
        "Local: Tue 27 Oct, 7:00 PM EDT Zulu: Tue 27 Oct, 2300Z " +
          "When the event opens. Starts before the event is posted.",
      );
  });

  test("clears its value when the box is cleared", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-27T23:00:00Z",
    });
    await screen.getByLabelText("Start").clear();
    await expect.element(screen.getByTestId("bound")).toHaveTextContent("none");
  });

  // The box reports "" while any part is blank: the other parts must stay.
  test("keeps the other parts while one is typed again", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-27T23:00:00Z",
    });
    await screen.getByLabelText("Start").click();
    await userEvent.keyboard("{Home}{Backspace}");
    await expect.element(screen.getByTestId("bound")).toHaveTextContent("none");
    await userEvent.keyboard("11");
    await expect
      .element(screen.getByTestId("bound"))
      .toHaveTextContent("2026-11-28T00:00:00.000Z");
  });

  // The year passes through 0002, 0020 and 0202 on the way.
  test("takes a year typed a digit at a time", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-27T23:00:00Z",
    });
    await screen.getByLabelText("Start").click();
    await userEvent.keyboard("{Home}{ArrowRight}{ArrowRight}2027");
    await expect
      .element(screen.getByTestId("bound"))
      .toHaveTextContent("2027-10-27T23:00:00.000Z");
  });

  test("follows a value the page changes", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-27T23:00:00Z",
    });
    await screen.rerender({ value: "2026-10-28T00:30:00Z" });
    await expect
      .element(screen.getByLabelText("Start"))
      .toHaveValue("2026-10-27T20:30");
  });

  test("sends the UTC value with a form under its name", async () => {
    const screen = await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
      name: "start",
    });
    await screen.getByLabelText("Start").fill("2026-10-27T19:00");
    const sent =
      screen.container.querySelectorAll<HTMLInputElement>('[name="start"]');
    expect(sent).toHaveLength(1);
    await expect.element(sent[0]).toHaveValue("2026-10-27T23:00:00.000Z");
  });

  test("sends the value with the form it names", async () => {
    const form = document.createElement("form");
    form.id = "event";
    document.body.append(form);
    await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
      name: "start",
      form: "event",
      value: "2026-10-27T23:00:00Z",
    });
    expect(new FormData(form).get("start")).toBe("2026-10-27T23:00:00Z");
    form.remove();
  });

  test("sends nothing while disabled", async () => {
    const screen = await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
      name: "start",
      value: "2026-10-27T23:00:00Z",
      disabled: true,
    });
    const form = document.createElement("form");
    screen.container.before(form);
    form.append(screen.container);
    expect([...new FormData(form).keys()]).toEqual([]);
    form.remove();
  });

  test("still calls a caller's oninput", async () => {
    const oninput = vi.fn();
    const screen = await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
      oninput,
    });
    await screen.getByLabelText("Start").fill("2026-10-27T19:00");
    expect(oninput).toHaveBeenCalled();
  });

  test("takes min and max as instants, like its value", async () => {
    const screen = await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
      min: "2026-10-20T21:00:00Z",
      max: "2026-11-20T21:00:00Z",
    });
    const box = screen.getByLabelText("Start");
    await expect.element(box).toHaveAttribute("min", "2026-10-20T17:00");
    await expect.element(box).toHaveAttribute("max", "2026-11-20T16:00");
  });

  test("adds a caller's class to its wrapper and attributes to the box", async () => {
    const screen = await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
      "aria-describedby": "note",
      required: true,
      class: "mt-4",
    });
    const box = screen.getByLabelText("Start");
    await expect.element(box).toBeRequired();
    expect(box.element().getAttribute("aria-describedby")).toMatch(/ note$/);
    await expect
      .element(screen.container.firstElementChild as HTMLElement)
      .toHaveStyle({ marginTop: "16px" });
  });

  // Input's roles: `muted` fill, `input` border, `foreground` text; the
  // read-out in `muted-foreground`.
  test.each(SCHEMES)("takes the input roles in %s", async (scheme) => {
    const screen = await renderIn(scheme, EventStartField, {
      value: "2026-10-27T23:00:00Z",
    });
    await expect.element(screen.getByLabelText("Start")).toHaveStyle({
      backgroundColor: role("muted", scheme),
      borderColor: role("input", scheme),
      color: role("foreground", scheme),
    });
    await expect
      .element(screen.getByText(/^Zulu/).element().parentElement)
      .toHaveStyle({ color: role("muted-foreground", scheme) });
  });

  // The guide's `ring` role.
  test.each(SCHEMES)(
    "shows a ring outline when tabbed to in %s",
    async (scheme) => {
      const screen = await renderIn(scheme, DateTimeInput, {
        "aria-label": "Start",
      });
      await userEvent.tab();
      const box = screen.getByLabelText("Start");
      await expect.element(box).toHaveFocus();
      await expect.element(box).toHaveStyle({
        outlineStyle: "solid",
        outlineColor: role("ring", scheme),
      });
    },
  );

  test("is at least 44px tall", async () => {
    const screen = await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
    });
    const box = screen.getByLabelText("Start").element();
    expect(box.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  describe("on the server", () => {
    // The server can't know the member's zone, so it leaves the box and
    // read-out empty rather than show Zulu as local; the form still sends
    // the value.
    test("sends the value but shows no local time", async () => {
      const html = await commands.serverRender(PATH, {
        "aria-label": "Start",
        name: "start",
        value: "2026-10-27T23:00:00Z",
      });
      const page = new DOMParser().parseFromString(html, "text/html");
      const box = page.querySelector<HTMLInputElement>(
        'input[type="datetime-local"]',
      )!;
      expect(box.getAttribute("value") ?? "").toBe("");
      expect(
        page.querySelector<HTMLInputElement>('[name="start"]')!.value,
      ).toBe("2026-10-27T23:00:00Z");
      expect(page.querySelector("p")!.textContent!.trim()).toBe("");
    }, 60_000);
  });
});
