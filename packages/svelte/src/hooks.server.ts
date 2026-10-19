// The playground's server hook, as an app's would be, applied only to the
// colour-scheme page: the other pages show each specimen on a light page
// next to a dark one, which a dark <html> would undo (there are no light
// islands, decision 0001). `?fallback=device` tries the device fallback.
import type { Handle } from "@sveltejs/kit/hooks";
import { colorSchemeHandle } from "./lib/hooks.ts";

const dark = colorSchemeHandle({ fallback: "dark" });
const device = colorSchemeHandle({ fallback: "device" });

export const handle: Handle = (input) => {
  const { url } = input.event;
  if (!url.pathname.startsWith("/color-scheme"))
    return input.resolve(input.event);
  return url.searchParams.get("fallback") === "device"
    ? device(input)
    : dark(input);
};
