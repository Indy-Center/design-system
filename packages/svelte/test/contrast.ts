// WCAG contrast of an element's text against its own fill, laid over the
// surface it sits on. Runs in the browser: a canvas turns any CSS colour
// (Tailwind's oklch included) into sRGB and blends see-through fills as the
// page does.
import tokens from "@indy-center/centerline-tokens/tokens.json" with { type: "json" };
import { expect } from "vitest";
import type { Scheme } from "./schemes.ts";

const surfacesOf = (scheme: "light" | "dark") => ({
  background: tokens[scheme].color.background,
  card: tokens[scheme].color.card,
});

/**
 * The surfaces a component can sit on in each scheme, the page and a card,
 * from the tokens. The dark header sits on dark surfaces.
 */
export const SURFACES: Record<Scheme, { background: string; card: string }> = {
  light: surfacesOf("light"),
  dark: surfacesOf("dark"),
  "dark-header": surfacesOf("dark"),
};

/** Every scheme, for `test.each`. */
export const SCHEMES = Object.keys(SURFACES) as Scheme[];

/**
 * The colours of a span with `classes`, placed beside `element` so it sits
 * in the same scheme, then removed. For checking a component against the
 * guide's Tailwind steps ("text in -800"), which the guide names by step
 * rather than by hex.
 */
export function styleOfClasses(classes: string, element: Element) {
  const probe = document.createElement("span");
  probe.className = classes;
  element.parentElement!.append(probe);
  const { color, backgroundColor, borderColor } = getComputedStyle(probe);
  probe.remove();
  return { color, backgroundColor, borderColor };
}

/**
 * `colour` (any CSS colour) at `percent` opacity, as the browser computes
 * Tailwind's opacity modifier (`bg-primary/15`: a mix in oklab with
 * transparent).
 */
export function translucent(colour: string, percent: number) {
  const probe = document.createElement("div");
  probe.style.color = `color-mix(in oklab, ${colour} ${percent}%, transparent)`;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

/** `colours` painted in order onto a pixel; its sRGB bytes. */
function paint(...colours: string[]): [number, number, number] {
  const context = document.createElement("canvas").getContext("2d")!;
  for (const colour of colours) {
    context.fillStyle = colour;
    context.fillRect(0, 0, 1, 1);
  }
  const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function luminance(rgb: [number, number, number]) {
  const [r, g, b] = rgb.map((byte) => {
    const c = byte / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * The contrast ratio of `element`'s text on its background, with that
 * background laid over `surface` (a hex), and over any `layers` painted on
 * the surface first (such as a pattern's dots).
 */
export function contrastOn(
  element: Element,
  surface: string,
  ...layers: string[]
) {
  const style = getComputedStyle(element);
  const fill = paint(surface, ...layers, style.backgroundColor);
  const text = paint(`rgb(${fill.join(" ")})`, style.color);
  const [lighter, darker] = [luminance(text), luminance(fill)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * WCAG 2.2 AA: `element`'s text is 4.5:1 or more on the page and on a card
 * in `scheme`.
 */
export function expectReadable(element: Element, scheme: Scheme) {
  const { background, card } = SURFACES[scheme];
  expect(contrastOn(element, background)).toBeGreaterThanOrEqual(4.5);
  expect(contrastOn(element, card)).toBeGreaterThanOrEqual(4.5);
}

/**
 * WCAG 2.2 AA for a state shown by a border: `element`'s border is 3:1 or
 * more on the page and on a card in `scheme`.
 */
export function expectBorderVisible(element: Element, scheme: Scheme) {
  const border = getComputedStyle(element).borderTopColor;
  for (const surface of Object.values(SURFACES[scheme])) {
    const [lighter, darker] = [
      luminance(paint(surface, border)),
      luminance(paint(surface)),
    ].sort((a, b) => b - a);
    expect((lighter + 0.05) / (darker + 0.05)).toBeGreaterThanOrEqual(3);
  }
}
