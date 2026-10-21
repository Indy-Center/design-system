import type { ComponentProps } from "svelte";
import { describe, expect, test } from "vitest";
import { page } from "vitest/browser";
import type { AirportInfo } from "../aviation/airport.ts";
import type { VnasPosition } from "../aviation/resolvePosition.ts";
import {
  indyCenter,
  lexingtonApproach,
  lexingtonTower,
  samplePositions,
} from "../../playground/positions.ts";
import { onScreen, readOut } from "../../../test/readOut.ts";
import { role } from "../../../test/roles.ts";
import { renderIn } from "../../../test/schemes.ts";
import WithPositions from "../../../test/WithPositions.svelte";
import Position from "./Position.svelte";

const PILOTS = ["airport", "radioName", "frequency"] as const;
// Its name shows only with airportAt="under".
const KLEX: AirportInfo = { code: "KLEX", name: "Blue Grass" };

/** Renders Position below a layout that set `positions`. */
async function show(
  props: ComponentProps<typeof Position>,
  { positions = samplePositions }: { positions?: VnasPosition[] } = {},
) {
  const screen = await renderIn("light", WithPositions, {
    positions,
    component: Position,
    props,
  });
  const root = screen.container.firstElementChild as HTMLElement;
  return { screen, root };
}

/** The element that holds exactly `text` on screen. */
function part(root: Element, text: string): HTMLElement {
  const all = [root, ...root.querySelectorAll<HTMLElement>("*")];
  const found = all.filter((e) => onScreen(e) === text).at(-1) as
    HTMLElement | undefined;
  if (!found) throw new Error(`No part reads "${text}" in "${onScreen(root)}"`);
  return found;
}

/** `part`, as a locator for `expect.element`. */
const partLocator = (root: Element, text: string) =>
  page.elementLocator(part(root, text));

const top = (e: Element) => e.getBoundingClientRect().top;
const left = (e: Element) => e.getBoundingClientRect().left;

describe("Position", () => {
  describe("stacked, as controllers see it (the default)", () => {
    test("leads with the radio name, the frequency on its right; beneath, the short name then the sector", async () => {
      const { root } = await show({ callsign: "IND_83_CTR" });
      expect(onScreen(root)).toBe(
        "Indy Center 128.22 IND_83_CTR · Falmouth 83",
      );

      const radio = part(root, "Indy Center");
      const frequency = part(root, "128.22");
      const second = part(root, "IND_83_CTR · Falmouth 83");
      expect(top(frequency)).toBeCloseTo(top(radio), -1);
      expect(left(frequency)).toBeGreaterThan(left(radio));
      expect(top(second)).toBeGreaterThan(top(radio) + 10);
    });

    test("without the radio name, leads with the sector, the short name beneath", async () => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        show: ["shortName", "name"],
      });
      expect(onScreen(root)).toBe("Falmouth 83 IND_83_CTR");
      expect(top(part(root, "IND_83_CTR"))).toBeGreaterThan(
        top(part(root, "Falmouth 83")) + 10,
      );
    });

    test("reads out the radio name, the frequency spoken, the short name and the sector", async () => {
      const { root } = await show({ callsign: "IND_83_CTR" });
      expect(readOut(root)).toBe(
        "Indy Center one two eight point two two IND_83_CTR Falmouth 83",
      );
    });

    test("the leading name and frequency in foreground, the rest muted", async () => {
      const { root } = await show({ callsign: "IND_83_CTR" });
      await expect
        .element(partLocator(root, "Indy Center"))
        .toHaveStyle({ color: role("foreground", "light") });
      await expect
        .element(partLocator(root, "128.22"))
        .toHaveStyle({ color: role("foreground", "light") });
      await expect
        .element(partLocator(root, "IND_83_CTR · Falmouth 83"))
        .toHaveStyle({ color: role("muted-foreground", "light") });
    });

    // The frequency's mono is Frequency's.
    test("the radio name is semibold, the short name mono", async () => {
      const { root } = await show({ callsign: "IND_83_CTR" });
      expect(getComputedStyle(part(root, "Indy Center")).fontWeight).toBe(
        "600",
      );
      expect(getComputedStyle(part(root, "IND_83_CTR")).fontFamily).toMatch(
        /mono/i,
      );
    });
  });

  // Each text field alone is tested under layout inline, where a stray dot
  // would show.
  describe("show", () => {
    test("airport alone shows the airport code", async () => {
      const { root } = await show({
        callsign: "LEX_TWR",
        show: ["airport"],
        airport: KLEX,
      });
      expect(onScreen(root)).toBe("KLEX");
    });

    test("leaves the airport off unless asked", async () => {
      const { root } = await show({ callsign: "LEX_TWR", airport: KLEX });
      expect(onScreen(root)).not.toContain("KLEX");
    });

    test("shows no airport for a position without one", async () => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        show: [...PILOTS],
      });
      expect(onScreen(root)).toBe("Indy Center 128.22");
    });
  });

  describe("layout inline", () => {
    test("puts everything on one line, the frequency last", async () => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        layout: "inline",
      });
      expect(onScreen(root)).toBe(
        "Indy Center · IND_83_CTR · Falmouth 83 · 128.22",
      );
      const line = top(part(root, "Indy Center"));
      expect(top(part(root, "Falmouth 83"))).toBeCloseTo(line, -1);
      expect(top(part(root, "128.22"))).toBeCloseTo(line, -1);
    });

    test.each([
      ["shortName", "IND_83_CTR"],
      ["radioName", "Indy Center"],
      ["name", "Falmouth 83"],
      ["frequency", "128.22"],
    ] as const)("%s alone shows %s, no dot", async (field, text) => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        show: [field],
        layout: "inline",
      });
      expect(onScreen(root)).toBe(text);
    });

    test("reads out the same, without the dots", async () => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        layout: "inline",
      });
      expect(readOut(root)).toBe(
        "Indy Center IND_83_CTR Falmouth 83 one two eight point two two",
      );
    });
  });

  describe("airportAt", () => {
    test('"right" (pilots): the code after the radio name, in muted mono on its line', async () => {
      const { root } = await show({
        callsign: "LEX_TWR",
        show: [...PILOTS],
        airportAt: "right",
        airport: KLEX,
      });
      expect(onScreen(root)).toBe("Lexington Tower · KLEX 119.10");
      const code = part(root, "KLEX");
      const radio = part(root, "Lexington Tower");
      expect(left(code)).toBeGreaterThan(left(radio));
      expect(top(code)).toBeCloseTo(top(radio), -1);
      expect(getComputedStyle(code).fontFamily).toMatch(/mono/i);
      // On the same baseline: no lift.
      expect(getComputedStyle(code).verticalAlign).toBe("baseline");
      expect(getComputedStyle(code).position).toBe("static");
    });

    test('"right": the code in muted-foreground', async () => {
      const { root } = await show({
        callsign: "LEX_TWR",
        show: [...PILOTS],
        airportAt: "right",
        airport: KLEX,
      });
      await expect
        .element(partLocator(root, "KLEX"))
        .toHaveStyle({ color: role("muted-foreground", "light") });
    });

    test('"right" reads out the code after the radio name', async () => {
      const { root } = await show({
        callsign: "LEX_E_APP",
        show: [...PILOTS],
        airportAt: "right",
        airport: KLEX,
      });
      expect(readOut(root)).toBe(
        "Lexington Approach KLEX one two zero point one five",
      );
    });

    test('"left": the code in a narrow column before the rest', async () => {
      const { root } = await show({
        callsign: "LEX_TWR",
        show: [...PILOTS],
        airportAt: "left",
        airport: KLEX,
      });
      expect(onScreen(root)).toBe("KLEX Lexington Tower 119.10");
      const code = part(root, "KLEX");
      const radio = part(root, "Lexington Tower");
      expect(left(code)).toBeLessThan(left(radio));
      expect(top(code)).toBeCloseTo(top(radio), -1);
    });

    test('"left": the code in foreground-soft', async () => {
      const { root } = await show({
        callsign: "LEX_TWR",
        show: [...PILOTS],
        airportAt: "left",
        airport: KLEX,
      });
      await expect
        .element(partLocator(root, "KLEX"))
        .toHaveStyle({ color: role("foreground-soft", "light") });
    });

    test('"left" keeps the column without an airport, so rows line up', async () => {
      const withAirport = await show({
        callsign: "LEX_TWR",
        show: [...PILOTS],
        airportAt: "left",
        airport: KLEX,
      });
      const without = await show({
        callsign: "IND_83_CTR",
        show: [...PILOTS],
        airportAt: "left",
      });
      expect(left(part(without.root, "Indy Center"))).toBeCloseTo(
        left(part(withAirport.root, "Lexington Tower")),
        0,
      );
    });

    test('"under": the code and name on the second line', async () => {
      const { root } = await show({
        callsign: "LEX_TWR",
        show: [...PILOTS],
        airportAt: "under",
        airport: KLEX,
      });
      expect(onScreen(root)).toBe("Lexington Tower 119.10 KLEX Blue Grass");
      const second = part(root, "KLEX Blue Grass");
      expect(top(second)).toBeGreaterThan(
        top(part(root, "Lexington Tower")) + 10,
      );
      expect(getComputedStyle(part(root, "KLEX")).fontFamily).toMatch(/mono/i);
    });
  });

  // With no layout setting positions, there are none: positions.test.ts.
  describe("looking itself up", () => {
    test("a relief login shows as the position it resolves to, with no note", async () => {
      const { root } = await show({ callsign: "IND_831_CTR" });
      expect(onScreen(root)).toBe(
        "Indy Center 128.22 IND_83_CTR · Falmouth 83",
      );
    });

    test("an unknown callsign shows alone, in mono, whatever show asks for", async () => {
      const { root } = await show({
        callsign: "IND_X_CTR",
        show: ["shortName", "airport", "radioName", "name", "frequency"],
        airport: { code: "KIND" },
      });
      expect(onScreen(root)).toBe("IND_X_CTR");
      expect(getComputedStyle(part(root, "IND_X_CTR")).fontFamily).toMatch(
        /mono/i,
      );
    });

    test("follows the positions the layout sets", async () => {
      const { screen, root } = await show(
        { callsign: "LEX_E_APP" },
        { positions: [indyCenter] },
      );
      expect(onScreen(root)).toBe("LEX_E_APP");
      await screen.rerender({
        positions: [indyCenter, lexingtonApproach],
      });
      expect(onScreen(screen.container)).toBe(
        "Lexington Approach 120.15 LEX_E_APP · Radar East",
      );
    });
  });

  describe("props win over the lookup", () => {
    test("radioName and frequency", async () => {
      const { root } = await show({
        callsign: "IND_83_CTR",
        radioName: "Indy Approach",
        frequency: 133400000,
      });
      expect(onScreen(root)).toBe(
        "Indy Approach 133.40 IND_83_CTR · Falmouth 83",
      );
    });

    test("a frequency as written", async () => {
      const { root } = await show({
        callsign: "LEX_TWR",
        show: ["radioName", "frequency"],
        frequency: "118.825",
      });
      expect(onScreen(root)).toBe("Lexington Tower 118.82");
    });

    test("for a callsign the positions don't have, they show with it", async () => {
      const { root } = await show({
        callsign: "CLE_CTR",
        radioName: "Cleveland Center",
        frequency: 132175000,
      });
      expect(onScreen(root)).toBe("Cleveland Center 132.17 CLE_CTR");
    });

    test("a frequency that isn't one is ignored", async () => {
      const known = await show({
        callsign: "LEX_TWR",
        show: ["radioName", "frequency"],
        frequency: "soon",
      });
      expect(onScreen(known.root)).toBe("Lexington Tower 119.10");
      const unknown = await show({
        callsign: "CLE_CTR",
        show: ["radioName", "frequency"],
        frequency: "soon",
      });
      expect(onScreen(unknown.root)).toBe("CLE_CTR");
    });
  });

  test("decimals={3} shows the frequency's third decimal", async () => {
    const { root } = await show({
      callsign: "IND_83_CTR",
      show: ["frequency"],
      decimals: 3,
    });
    expect(onScreen(root)).toBe("128.225");
  });

  test("puts a caller's class and attributes on its root", async () => {
    const { root } = await show({
      callsign: lexingtonTower.callsign,
      class: "ml-4",
      id: "tower",
    });
    expect(root.id).toBe("tower");
    await expect.element(root).toHaveStyle({ marginLeft: "16px" });
  });

  test("an unknown callsign keeps the caller's class and attributes", async () => {
    const { root } = await show({
      callsign: "IND_X_CTR",
      class: "ml-4",
      id: "unknown",
    });
    expect(root.id).toBe("unknown");
    await expect.element(root).toHaveStyle({ marginLeft: "16px" });
  });
});
