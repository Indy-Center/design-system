// Server code, for an app's +layout.server.ts and the like:
// import { fetchPositions } from "@indy-center/centerline-svelte/server";
import { BROWSER } from "esm-env";
import { createPositionsFetcher } from "./positions/fetchPositions.js";

if (BROWSER) {
  // Data Admin sends no CORS header, so the fetch would fail in the browser.
  throw new Error(
    "@indy-center/centerline-svelte/server is for server code: import it from a +page.server.ts or +layout.server.ts.",
  );
}

/**
 * An ARTCC's positions from vNAS Data Admin, slimmed to `VnasPosition`,
 * shared by every caller in this server process and checked hourly.
 *
 * To be replaced by identity's `getFacilityPositions()` RPC, so apps stop
 * each pulling Data Admin; apps then change only the line that calls this.
 */
export const fetchPositions = createPositionsFetcher({
  // Looked up on each call, so a test can stub the global fetch.
  fetch: (input, init) => globalThis.fetch(input, init),
});

// The member's time zone from the request's cookie and their profile, for
// the root layout's load to hand to `setTimeZone`.
export { readTimeZone, type ReadTimeZoneOptions } from "./timeZone/timeZone.js";
