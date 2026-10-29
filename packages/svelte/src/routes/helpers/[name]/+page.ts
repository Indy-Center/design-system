// A helper's page: a doc with no component, so no demo. The layout draws
// the doc; any other name is not a page.
import { error } from "@sveltejs/kit";
import { findPage } from "../../../playground/site.ts";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  if (findPage(`/helpers/${params.name}`)?.kind !== "helper")
    error(404, "Not found");
};
