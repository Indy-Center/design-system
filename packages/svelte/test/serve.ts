import type { RequestEvent } from "@sveltejs/kit";
import type { Handle, ResolveOptions } from "@sveltejs/kit/hooks";

/** A plain app template, as SvelteKit hands it to `transformPageChunk`. */
export const template = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
  </head>
  <body><p>Hello</p></body>
</html>`;

/**
 * Runs `handle` for one request carrying `cookie` (a Cookie header, as
 * `document.cookie` reads) and returns the page it serves, built from `html`.
 * `chunks` streams the page in those pieces instead, as SvelteKit may.
 */
export async function serve(
  handle: Handle,
  {
    cookie = "",
    html = template,
    chunks = [html],
  }: { cookie?: string; html?: string; chunks?: string[] } = {},
): Promise<string> {
  const jar = new Map<string, string>();
  for (const pair of cookie.split(";")) {
    const [name, value = ""] = pair.trim().split("=");
    if (name) jar.set(name, value);
  }
  const event = {
    cookies: { get: (name: string) => jar.get(name) },
  } as unknown as RequestEvent;
  const response = await handle({
    event,
    resolve: async (_event, options?: ResolveOptions) => {
      let page = "";
      for (const [i, chunk] of chunks.entries()) {
        const done = i === chunks.length - 1;
        page +=
          (await options?.transformPageChunk?.({ html: chunk, done })) ?? chunk;
      }
      return new Response(page);
    },
  });
  return response.text();
}

/** The `data-theme` the served page's `<html>` carries, if any. */
export function htmlTheme(page: string): string | undefined {
  return /<html[^>]*\sdata-theme="([^"]*)"/.exec(page)?.[1];
}
