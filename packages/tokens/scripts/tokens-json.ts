import type { Plugin } from "@terrazzo/parser";
import { guideHex, resolveSchemes, schemes } from "./schemes.ts";

/**
 * Writes tokens.json: each scheme's resolved values, for code that can't
 * read CSS custom properties (a canvas, a script). Colours are the token
 * files' hex, as the guide gives them; font stacks are CSS font-family
 * values, ready for `ctx.font`.
 *
 *   { "light": { "color": { "card": "#FFFFFF", … }, "font": { … } }, "dark": … }
 */
export default function tokensJson(): Plugin {
  return {
    name: "indy-center:tokens-json",
    enforce: "post",
    async build({ resolver, getTransforms, outputFile }) {
      const resolved = resolveSchemes(resolver);
      const out: Record<string, Record<string, Record<string, string>>> = {};
      for (const theme of schemes) {
        const scheme: Record<string, Record<string, string>> = {};
        for (const token of Object.values(resolved[theme])) {
          const [group, ...rest] = token.id.split(".");
          const name = rest.join(".");
          let value: string;
          if (token.$type === "color") {
            value = guideHex(token, token.id);
          } else {
            const [css] = getTransforms({
              format: "css",
              id: token.id,
              input: { theme },
            });
            if (typeof css?.value !== "string") {
              throw new Error(`${token.id}: no CSS value to write`);
            }
            value = css.value;
          }
          (scheme[group!] ??= {})[name] = value;
        }
        out[theme] = scheme;
      }
      outputFile("tokens.json", `${JSON.stringify(out, null, 2)}\n`);
    },
  };
}
