import { describe, expect, test, vi } from "vitest";
import { commands, userEvent } from "vitest/browser";
import { pinClockInIndianapolis } from "../../../test/clock.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import DateTimeInput from "./DateTimeInput.svelte";
import EventStartField from "./DateTimeInput.test.svelte";

const PATH = "/src/lib/DateTimeInput/DateTimeInput.svelte";

// The device is in Indianapolis, the clock at 2100Z on Tuesday 20 October
// 2026 (5:00 PM EDT).
pinClockInIndianapolis();

// The box's looks (roles, ring, invalid border, 44px) are textControl's,
// and the hint and error Description's (formControl's tests).
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

  // 1:30 AM on 1 November 2026 happens twice in Indianapolis: in EDT, then
  // in EST.
  test("takes a time the clocks pass twice as the first", async () => {
    const screen = await renderIn("light", EventStartField, {});
    await screen.getByLabelText("Start").fill("2026-11-01T01:30");
    await expect
      .element(screen.getByTestId("bound"))
      .toHaveTextContent("2026-11-01T05:30:00.000Z");
  });

  test("shows a UTC value in the member's local time", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-20T23:00:00Z",
    });
    await expect
      .element(screen.getByLabelText("Start"))
      .toHaveValue("2026-10-20T19:00");
  });

  test("reads the value back in local time and Zulu, each on its own day", async () => {
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
    await expect
      .element(screen.getByLabelText("Start"))
      .toHaveAccessibleDescription("In your time zone, Eastern Daylight Time.");
  });

  // en-US has no name for some zones, only an offset ("GMT-03:00"). Which
  // ones depends on the browser's time-zone data (a newer Chromium names
  // America/Punta_Arenas), so take the first this browser doesn't name.
  test("names a zone without a name by its ID", async () => {
    const unnamed = Intl.supportedValuesOf("timeZone").find((timeZone) =>
      /^GMT[+-]/.test(
        new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "long" })
          .formatToParts()
          .find((part) => part.type === "timeZoneName")?.value ?? "",
      ),
    );
    expect(unnamed).toBeDefined();
    await commands.emulateTimeZone(unnamed!);
    const screen = await renderIn("light", EventStartField, {});
    await expect
      .element(screen.getByLabelText("Start"))
      .toHaveAccessibleDescription(`In your time zone, ${unnamed}.`);
  });

  test("is described by its read-out, then the field's hint and error, and marked invalid", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-27T23:00:00Z",
      hint: "When the event opens.",
      error: "Starts before the event is posted.",
    });
    const box = screen.getByLabelText("Start");
    await expect
      .element(box)
      .toHaveAccessibleDescription(
        "Local: Tue 27 Oct, 7:00 PM EDT Zulu: Tue 27 Oct, 2300Z " +
          "When the event opens. Starts before the event is posted.",
      );
    await expect.element(box).toHaveAttribute("aria-invalid", "true");
    await expect
      .element(box)
      .toHaveStyle({ borderColor: role("destructive", "light") });
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
    expect(new FormData(form).get("start")).toBe("2026-10-27T23:00:00.000Z");
    form.remove();
  });

  test("sends a value given with an offset in UTC", async () => {
    const screen = await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
      name: "start",
      value: "2026-10-27T19:00-04:00",
    });
    await expect
      .element(
        screen.container.querySelector<HTMLInputElement>('[name="start"]'),
      )
      .toHaveValue("2026-10-27T23:00:00.000Z");
  });

  test("sends a value that isn't a date as it was given", async () => {
    const screen = await renderIn("light", DateTimeInput, {
      "aria-label": "Start",
      name: "start",
      value: "not a date",
    });
    await expect
      .element(
        screen.container.querySelector<HTMLInputElement>('[name="start"]'),
      )
      .toHaveValue("not a date");
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

  // The box in textControl's input roles; the read-out in `muted-foreground`.
  test("is a text control, its read-out muted", async () => {
    const screen = await renderIn("light", EventStartField, {
      value: "2026-10-27T23:00:00Z",
    });
    await expect.element(screen.getByLabelText("Start")).toHaveStyle({
      backgroundColor: role("muted", "light"),
      borderColor: role("input", "light"),
    });
    await expect
      .element(screen.getByText(/^Zulu/).element().parentElement)
      .toHaveStyle({ color: role("muted-foreground", "light") });
  });

  // The device is in Indianapolis; the member saved Chicago (CDT, UTC−5),
  // so the box, its read-out and Time agree on Chicago.
  describe("with a saved time zone other than the device's", () => {
    const chicago = { kind: "zone", zone: "America/Chicago" } as const;

    test("shows a UTC value in the saved zone", async () => {
      const screen = await renderIn("light", EventStartField, {
        choice: chicago,
        value: "2026-10-27T23:00:00Z",
      });
      await expect
        .element(screen.getByLabelText("Start"))
        .toHaveValue("2026-10-27T18:00");
      await expect
        .element(screen.getByLabelText("Start"))
        .toHaveAccessibleDescription(
          "Local: Tue 27 Oct, 6:00 PM CDT Zulu: Tue 27 Oct, 2300Z",
        );
    });

    test("turns the time typed in the saved zone into UTC", async () => {
      const screen = await renderIn("light", EventStartField, {
        choice: chicago,
      });
      await screen.getByLabelText("Start").fill("2026-10-27T18:00");
      await expect
        .element(screen.getByTestId("bound"))
        .toHaveTextContent("2026-10-27T23:00:00.000Z");
      await expect
        .element(screen.getByText(/^Local/))
        .toHaveTextContent("Local: Tue 27 Oct, 6:00 PM CDT");
    });

    // Chicago is CDT (UTC−5) in October and CST (UTC−6) after 1 November.
    test("takes min and max in the saved zone", async () => {
      const screen = await renderIn("light", EventStartField, {
        choice: chicago,
        min: "2026-10-20T21:00:00Z",
        max: "2026-11-20T21:00:00Z",
      });
      const box = screen.getByLabelText("Start");
      await expect.element(box).toHaveAttribute("min", "2026-10-20T16:00");
      await expect.element(box).toHaveAttribute("max", "2026-11-20T15:00");
    });

    test("names the saved zone while empty", async () => {
      const screen = await renderIn("light", EventStartField, {
        choice: chicago,
      });
      await expect
        .element(screen.getByLabelText("Start"))
        .toHaveAccessibleDescription(
          "In your time zone, Central Daylight Time.",
        );
    });

    test("in Zulu, the read-out shows only Zulu", async () => {
      const screen = await renderIn("light", EventStartField, {
        choice: { kind: "zulu" },
        value: "2026-10-27T23:00:00Z",
      });
      await expect
        .element(screen.getByLabelText("Start"))
        .toHaveAccessibleDescription("Zulu: Tue 27 Oct, 2300Z");
      expect(screen.getByText(/^Local/).query()).toBeNull();
    });

    test("in Zulu, the box is in Zulu too", async () => {
      const screen = await renderIn("light", EventStartField, {
        choice: { kind: "zulu" },
        value: "2026-10-27T23:00:00Z",
      });
      const box = screen.getByLabelText("Start");
      await expect.element(box).toHaveValue("2026-10-27T23:00");
      await box.fill("2026-10-28T01:30");
      await expect
        .element(screen.getByTestId("bound"))
        .toHaveTextContent("2026-10-28T01:30:00.000Z");
      await expect
        .element(box)
        .toHaveAccessibleDescription("Zulu: Wed 28 Oct, 0130Z");
    });
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
      ).toBe("2026-10-27T23:00:00.000Z");
      expect(page.querySelector("p")!.textContent!.trim()).toBe("");
    }, 60_000);
  });
});
