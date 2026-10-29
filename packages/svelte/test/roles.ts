// The role colours a component test expects, read from the tokens' built
// `tokens.json`. How to use it: CONVENTIONS.md, Tests.
import tokens from "@indy-center/centerline-tokens/tokens.json" with { type: "json" };
import type { Scheme } from "./schemes.ts";

/** A role's name, as in `roles.tokens.json` and the `--color-*` variables. */
export type Role = keyof typeof tokens.light.color;

/**
 * `hex` (`#RRGGBB` or `#RRGGBBAA`) as `getComputedStyle` writes it:
 * `rgb(r, g, b)`, or `rgba(r, g, b, a)` with Chromium's rounding of alpha
 * (two places, or three when two don't give back the same byte).
 */
export function computedColour(hex: string): string {
  if (!/^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(hex)) {
    throw new Error(`Expected #RRGGBB or #RRGGBBAA, got ${hex}`);
  }
  const bytes = hex
    .slice(1)
    .match(/../g)!
    .map((pair) => parseInt(pair, 16));
  const [r, g, b, alpha] = bytes;
  if (alpha === undefined || alpha === 255) return `rgb(${r}, ${g}, ${b})`;
  const twoPlaces = Math.round((alpha / 255) * 100) / 100;
  const a =
    Math.round(twoPlaces * 255) === alpha
      ? twoPlaces
      : Math.round((alpha / 255) * 1000) / 1000;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * The colour `getComputedStyle` gives for `name` in `scheme`. The dark
 * header renders in the dark scheme's colours (see `schemes.ts`).
 */
export function role(name: Role, scheme: Scheme): string {
  const palette = scheme === "light" ? tokens.light : tokens.dark;
  return computedColour(palette.color[name]);
}
