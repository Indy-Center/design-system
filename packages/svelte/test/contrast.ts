// WCAG contrast of an element's text against its own fill, laid over the
// surface it sits on. Runs in the browser: a canvas turns any CSS colour
// (Tailwind's oklch included) into sRGB and blends see-through fills as the
// page does.

/** The guide's surfaces (background and card) in each scheme. */
export const SURFACES = {
  light: { background: "#F1F5F9", card: "#FFFFFF" },
  dark: { background: "#111827", card: "#1E293B" },
} as const;

/**
 * The computed style of a span with `classes`, placed beside `element` so
 * it sits in the same scheme. For checking a component against the
 * guide's Tailwind steps ("text in -800"), which the guide names by step
 * rather than by hex.
 */
export function styleOfClasses(classes: string, element: Element) {
  const probe = document.createElement("span");
  probe.className = classes;
  element.parentElement!.append(probe);
  return getComputedStyle(probe);
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
 * background laid over `surface` (a hex).
 */
export function contrastOn(element: Element, surface: string) {
  const style = getComputedStyle(element);
  const fill = paint(surface, style.backgroundColor);
  const text = paint(`rgb(${fill.join(" ")})`, style.color);
  const [lighter, darker] = [luminance(text), luminance(fill)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}
