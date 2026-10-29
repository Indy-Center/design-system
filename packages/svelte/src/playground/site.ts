// The reference site's pages, in sidebar order: built from the route
// folders and the docs beside the components, so adding a component never
// means editing this file.
import home from "./home.md?meta";
import { docHref, docKey } from "./docNames.ts";
import type { Doc, DocMeta } from "./markdown.ts";

/** A page in the sidebar. */
export type SitePage = {
  /** Its name: the doc's title, else the route's folder. */
  label: string;
  href: string;
  /** One line on what it is: the doc's description. */
  summary: string;
  /** A component's page draws a demo below its doc; a helper's has none. */
  kind: "site" | "component" | "helper";
  /** Its doc's path, for `loadDoc`. */
  doc?: string;
};

/** A heading in the sidebar, over its pages. */
export type SiteSection = { heading: string; pages: SitePage[] };

/** Every component's page: `src/routes/<name>/+page.svelte`. */
export const routes = Object.keys(import.meta.glob("../routes/*/+page.svelte"))
  .map((path) => path.split("/")[2])
  .sort();

const metas = import.meta.glob<DocMeta | undefined>("../lib/*/*.md", {
  query: "?meta",
  import: "default",
  eager: true,
});

// Drawn only for the page that shows it, so no page loads every doc.
const docs = import.meta.glob<Doc>("../lib/*/*.md", {
  query: "?html",
  import: "default",
});

const nameOf = (path: string) => path.split("/").pop()!.replace(/\.md$/, "");

/** The docs with front matter: a component's, or a helper's. */
const docPaths = Object.keys(metas).filter((path) => metas[path]);

const byLabel = (a: SitePage, b: SitePage) =>
  a.label.localeCompare(b.label, "en", { sensitivity: "base" });

const components: SitePage[] = routes
  .map((route) => {
    const doc = docPaths.find((path) => docKey(nameOf(path)) === docKey(route));
    const meta = doc ? metas[doc] : undefined;
    return {
      label: meta?.title ?? route,
      href: `/${route}`,
      summary: meta?.description ?? "",
      kind: "component" as const,
      doc,
    };
  })
  .sort(byLabel);

const helpers: SitePage[] = docPaths
  .filter((path) => !components.some((page) => page.doc === path))
  .map((path) => ({
    label: metas[path]!.title,
    href: docHref(nameOf(path), routes),
    summary: metas[path]!.description,
    kind: "helper" as const,
    doc: path,
  }))
  .sort(byLabel);

export const HOME: SitePage = {
  label: "Home",
  href: "/",
  summary: home!.description,
  kind: "site",
};

export const TOKENS: SitePage = {
  label: "Tokens",
  href: "/tokens",
  summary: "The brand colours and the colour roles, in light and dark.",
  kind: "site",
};

export const sections: SiteSection[] = [
  { heading: "Overview", pages: [HOME, TOKENS] },
  { heading: "Components", pages: components },
  { heading: "Helpers", pages: helpers },
];

/** Every page, in sidebar order. */
export const pages = sections.flatMap((section) => section.pages);

/** The page at `pathname`; a trailing slash doesn't count. */
export const findPage = (pathname: string) =>
  pages.find((page) => page.href === (pathname.replace(/(.)\/$/, "$1") || "/"));

/** `page`'s doc, drawn; none for a page without one. */
export const loadDoc = (page: SitePage) =>
  page.doc ? docs[page.doc]() : Promise.resolve(undefined);

/** The page's title: `<Page> | Centerline | Indy Center`, the home page's without the page. */
export const titleOf = (page: SitePage | undefined) =>
  [page && page !== HOME ? page.label : undefined, "Centerline", "Indy Center"]
    .filter(Boolean)
    .join(" | ");
