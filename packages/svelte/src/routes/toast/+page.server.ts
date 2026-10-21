import { redirect } from "@sveltejs/kit";
import { toastFromServer } from "../../lib/index.ts";

// A form action that saves nothing, then raises a toast and redirects, as
// an app's would.
export const actions = {
  default: ({ cookies }) => {
    toastFromServer(cookies, "success", "Saved on the server.");
    redirect(303, "/toast");
  },
};
