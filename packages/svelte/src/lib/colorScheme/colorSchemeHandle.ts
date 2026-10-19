import { DEV } from "esm-env";
import { COOKIE_NAME, parseColorScheme } from "./colorScheme.js";

export type ColorSchemeHandleOptions = {
  /**
   * What to serve when the cookie holds no choice. `'dark'` serves dark;
   * `'device'` serves nothing and lets an inline script set dark when the
   * device asks for it, else light.
   */
  fallback: "dark" | "device";
};

/**
 * The part of SvelteKit's `Handle` this hook uses. Written out, not
 * imported, so it fits Kit 2 (`Handle` from "@sveltejs/kit") and Kit 3
 * (from "@sveltejs/kit/hooks") alike.
 */
export type ColorSchemeHandle = <
  E extends { cookies: { get(name: string): string | undefined } },
>(input: {
  event: E;
  resolve: (
    event: E,
    opts?: {
      transformPageChunk?: (input: {
        html: string;
        done: boolean;
      }) => string | undefined | Promise<string | undefined>;
    },
  ) => Promise<Response>;
}) => Promise<Response>;

/**
 * Where the app's template asks for the device script, inside a
 * `<script nonce="%sveltekit.nonce%">` of its own, so it runs under a CSP.
 */
const SCRIPT_MARKER = /\/\*\s*@indy-center\/svelte color scheme\s*\*\//;

const HTML_TAG = /<html(?=[\s>])/i;

const MISSING_MARKER =
  "@indy-center/svelte: app.html has no colour-scheme script tag, so the " +
  "hook adds one without a nonce, which a Content Security Policy blocks. " +
  'Add <script nonce="%sveltekit.nonce%">/* @indy-center/svelte color scheme */</script> ' +
  "to <head> in src/app.html.";

/** Sets dark from the device's setting when the server set nothing. */
const DEVICE_SCRIPT =
  "(function(){var d=document.documentElement;" +
  'if(!d.hasAttribute("data-theme")&&matchMedia("(prefers-color-scheme: dark)").matches)' +
  'd.setAttribute("data-theme","dark")})()';

/**
 * A SvelteKit `handle` that writes the colour scheme onto `<html>` at
 * render: the choice in the shared cookie, else the fallback.
 */
export function colorSchemeHandle(
  options: ColorSchemeHandleOptions,
): ColorSchemeHandle {
  let warned = false;
  return ({ event, resolve }) => {
    const choice = parseColorScheme(event.cookies.get(COOKIE_NAME));
    const theme = choice ?? (options.fallback === "dark" ? "dark" : undefined);
    let written = false;
    return resolve(event, {
      transformPageChunk: ({ html }) => {
        // Only the chunk with <html> in it, which has <head> too.
        if (written || !HTML_TAG.test(html)) return html;
        written = true;
        if (theme) {
          return html
            .replace(HTML_TAG, `<html data-theme="${theme}"`)
            .replace(SCRIPT_MARKER, "");
        }
        if (SCRIPT_MARKER.test(html)) {
          return html.replace(SCRIPT_MARKER, DEVICE_SCRIPT);
        }
        if (DEV && !warned) {
          warned = true;
          console.warn(MISSING_MARKER);
        }
        return html.replace(
          /<head(\s[^>]*)?>/i,
          (head) => `${head}<script>${DEVICE_SCRIPT}</script>`,
        );
      },
    });
  };
}
