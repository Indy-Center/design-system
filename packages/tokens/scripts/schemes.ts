import type {
  Resolver,
  TokenNormalized,
  TokenNormalizedSet,
} from "@terrazzo/parser";

/** The colour schemes the resolver's `theme` modifier gives. */
export const schemes = ["light", "dark"] as const;

export type Scheme = (typeof schemes)[number];

/** Each scheme's tokens, resolved. */
export function resolveSchemes(
  resolver: Resolver,
): Record<Scheme, TokenNormalizedSet> {
  return {
    light: resolver.apply({ theme: "light" }),
    dark: resolver.apply({ theme: "dark" }),
  };
}

/**
 * The colour token `id`'s hex from its token file, uppercase, as the guide
 * gives it. Throws when `token` isn't a colour with a hex.
 */
export function guideHex(token: TokenNormalized | undefined, id: string) {
  if (token?.$type !== "color" || !token.$value.hex) {
    throw new Error(`${id}: colours need the guide's hex`);
  }
  return token.$value.hex.toUpperCase();
}
