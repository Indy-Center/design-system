// The reference site's Markdown, read at build (and by the dev server), so
// no renderer reaches the Worker or the published package. A Vite plugin:
// importing a `.md` file with one of these queries gives
//
// - `?meta`:   `{ title, description }`, from its front matter
// - `?html`:   the same with `html`, the body drawn as HTML, code highlighted
// - `?llms`:   its text for llms-full.txt, a `#` title over the body
// - `?tables`: its tables as `{ header, rows }`, each cell's Markdown
//
// A link to another doc goes to that doc's page; a link to any other file
// in the repo goes to the file on GitHub.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { Marked, type Token, type Tokens } from "marked";
import { createHighlighter, type Highlighter } from "shiki";
import type { Plugin } from "vite";
import { docHref, REPO, SITE } from "./docNames.ts";

/** A doc's front matter. */
export type DocMeta = { title: string; description: string };

/** A doc, drawn. */
export type Doc = DocMeta & { html: string };

/** One table: its head's cells and its rows' cells, as Markdown. */
export type DocTable = { header: string[]; rows: string[][] };

const QUERIES = ["meta", "html", "llms", "tables"] as const;

const LANGS = ["css", "html", "js", "json", "scss", "sh", "svelte", "ts"];

/** Splits `title:` and `description:` off the top of a doc. */
function frontMatter(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n/);
  const fields: Record<string, string> = {};
  for (const line of match?.[1].split("\n") ?? []) {
    const [, key, value] = line.match(/^(\w+):\s*(.*)$/) ?? [];
    if (key) fields[key] = value.replace(/^(["'])(.*)\1$/, "$2");
  }
  return {
    meta: fields.title
      ? { title: fields.title, description: fields.description ?? "" }
      : undefined,
    body: match ? source.slice(match[0].length) : source,
  };
}

export function markdown(): Plugin {
  let root = "";
  let highlighter: Promise<Highlighter> | undefined;

  // The route folders, which decide whether a doc's page is its component's.
  const routes = () =>
    readdirSync(join(root, "src/routes"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((name) =>
        existsSync(join(root, "src/routes", name, "+page.svelte")),
      );

  /** Where `href`, in `file`, goes: on the site, absolutely when `absolute`. */
  function resolveLink(file: string, href: string, absolute: boolean) {
    if (/^([a-z]+:|#|\/)/.test(href)) return href;
    const [path, hash] = href.split("#");
    const target = resolve(dirname(file), path);
    const lib = relative(join(root, "src/lib"), target);
    const anchor = hash ? `#${hash}` : "";
    if (!lib.startsWith("..") && target.endsWith(".md")) {
      const name = target.split("/").pop()!.replace(/\.md$/, "");
      return `${absolute ? SITE : ""}${docHref(name, routes())}${anchor}`;
    }
    return `${REPO}/${relative(join(root, "../.."), target)}${anchor}`;
  }

  async function toHtml(file: string, body: string) {
    const shiki = await (highlighter ??= createHighlighter({
      themes: ["github-light", "github-dark"],
      langs: LANGS,
    }));
    const marked = new Marked({
      gfm: true,
      walkTokens(token: Token) {
        if (token.type === "link")
          token.href = resolveLink(file, token.href, false);
      },
      renderer: {
        // Both themes' colours as custom properties, so the code follows
        // data-theme (playground.css).
        code({ text, lang }) {
          return shiki.codeToHtml(text, {
            lang: lang && LANGS.includes(lang) ? lang : "text",
            themes: { light: "github-light", dark: "github-dark" },
            defaultColor: false,
          });
        },
      },
    });
    // A wide table scrolls in a box of its own, not the page.
    return (marked.parse(body) as string)
      .replaceAll("<table>", '<div class="doc-table"><table>')
      .replaceAll("</table>", "</table></div>");
  }

  function toLlms(file: string, meta: DocMeta | undefined, body: string) {
    const text = body.replace(
      /\]\(([^)\s]+)\)/g,
      (_, href: string) => `](${resolveLink(file, href, true)})`,
    );
    return meta
      ? `# ${meta.title}\n\n> ${meta.description}\n\n${text.trim()}\n`
      : `${text.trim()}\n`;
  }

  function toTables(body: string): DocTable[] {
    return new Marked({ gfm: true })
      .lexer(body)
      .filter((token): token is Tokens.Table => token.type === "table")
      .map((table) => ({
        header: table.header.map((cell) => cell.text),
        rows: table.rows.map((row) => row.map((cell) => cell.text)),
      }));
  }

  return {
    name: "centerline-markdown",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
    },
    async load(id) {
      const [file, search] = id.split("?");
      if (!file.endsWith(".md") || !search) return;
      const query = QUERIES.find((name) =>
        new URLSearchParams(search).has(name),
      );
      if (!query) return;
      this.addWatchFile(file);
      const { meta, body } = frontMatter(readFileSync(file, "utf8"));
      const value =
        query === "meta"
          ? meta
          : query === "html"
            ? { ...meta, html: await toHtml(file, body) }
            : query === "llms"
              ? toLlms(file, meta, body)
              : toTables(body);
      return `export default ${JSON.stringify(value)};`;
    },
  };
}
