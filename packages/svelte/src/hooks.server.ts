// The playground's server hook, as an app's would be, applied only to the
// colour-scheme pages: the other pages show each specimen on a light page
// next to a dark one, which a dark <html> would undo (there are no light
// islands, decision 0001). On /color-scheme, `?fallback=device` tries the
// device fallback; /color-scheme-setting has it by default, for "Use my
// device's setting", and tries `?fallback=dark`, which hides that row.
import type { Handle } from "@sveltejs/kit/hooks";
import { colorSchemeHandle } from "./lib/hooks.ts";

const dark = colorSchemeHandle({ fallback: "dark" });
const device = colorSchemeHandle({ fallback: "device" });

export const handle: Handle = (input) => {
  const { url } = input.event;
  // Checked first: a prerendered route (llms.txt) can't read the query.
  if (!url.pathname.startsWith("/color-scheme"))
    return input.resolve(input.event);
  const fallback = url.searchParams.get("fallback");
  if (url.pathname.startsWith("/color-scheme-setting"))
    return fallback === "dark" ? dark(input) : device(input);
  return fallback === "device" ? device(input) : dark(input);
};
