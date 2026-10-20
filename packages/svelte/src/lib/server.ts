// Server code, for an app's +layout.server.ts and the like:
// import { fetchPositions } from "@indy-center/svelte/server";
import { BROWSER } from "esm-env";
import { createPositionsFetcher } from "./positions/fetchPositions.js";

if (BROWSER) {
  // Data Admin sends no CORS header, so the fetch would fail in the browser.
  throw new Error(
    "@indy-center/svelte/server is for server code: import it from a +page.server.ts or +layout.server.ts.",
  );
}

export {
  createPositionsFetcher,
  type PositionsFetcherOptions,
} from "./positions/fetchPositions.js";

/**
 * An ARTCC's positions from vNAS Data Admin, slimmed to `VnasPosition`,
 * shared by every caller in this server process and checked hourly.
 */
export const fetchPositions = createPositionsFetcher({
  // Looked up on each call, so a fetch patched after import is used.
  fetch: (input, init) => globalThis.fetch(input, init),
});
