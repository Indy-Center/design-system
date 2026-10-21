import { readTimeZone } from "../../lib/server.ts";

// As an app's root layout load would: the choice from the cookie, so the
// server draws it.
export const load = ({ cookies }) => ({ timeZone: readTimeZone(cookies) });
