import { readTimeZone } from "../../lib/server.ts";

// As an app's root layout load would: the saved time zone, which the box
// and its read-out both use.
export const load = ({ cookies }) => ({ timeZone: readTimeZone(cookies) });
