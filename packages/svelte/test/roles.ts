// The role colours a component test expects, read from the tokens' built
// `tokens.json`, so a palette change there needs no test edits. The tokens
// package holds those values to the brand guide (its tables test); a
// component test only checks that a part shows the right role.
//
//   import { role } from "../../../test/roles.ts";
//   await expect.element(link).toHaveStyle({ color: role("link", scheme) });
//
// Two roles with the same value (`muted` and `border`) can't be told apart
// by colour. Colours that aren't a role (`transparent`, a colour the test
// sets itself, a Tailwind stock step) stay as literals, with a comment.
import tokens from "@indy-center/tokens/tokens.json" with { type: "json" };
import type { Scheme } from "./schemes.ts";

/** A role's name, as in `roles.tokens.json` and the `--color-*` variables. */
export type Role = keyof typeof tokens.light.color;

/**
 * `hex` (`#RRGGBB` or `#RRGGBBAA`) as `getComputedStyle` writes it:
 * `rgb(r, g, b)`, or `rgba(r, g, b, a)` with Chromium's rounding of alpha
 * (two places, or three when two don't give back the same byte).
 */
export function computedColour(hex: string): string {
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
