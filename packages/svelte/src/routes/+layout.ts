// Finds the page in the sidebar and draws its doc, if it has one.
import { findPage, loadDoc } from "../playground/site.ts";
import type { LayoutLoad } from "./$types";

export const load: LayoutLoad = async ({ url }) => {
  const page = findPage(url.pathname);
  return { page, doc: page ? await loadDoc(page) : undefined };
};
