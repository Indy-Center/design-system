// Server code, for an app's +layout.server.ts and the like:
// import { readTimeZone } from "@indy-center/centerline-svelte/server";
import { BROWSER } from "esm-env";

if (BROWSER) {
  // A stray import from a component fails here at once, not later.
  throw new Error(
    "@indy-center/centerline-svelte/server is for server code: import it from a +page.server.ts or +layout.server.ts.",
  );
}

// The member's time zone from the request's cookie and their profile, for
// the root layout's load to hand to `setTimeZone`.
export { readTimeZone, type ReadTimeZoneOptions } from "./timeZone/timeZone.js";
