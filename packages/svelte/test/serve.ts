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
 */
export async function serve(
  handle: Handle,
  { cookie = "", html = template }: { cookie?: string; html?: string } = {},
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
    resolve: async (_event, options?: ResolveOptions) =>
      new Response(
        (await options?.transformPageChunk?.({ html, done: true })) ?? html,
      ),
  });
  return response.text();
}

/** The `data-theme` the served page's `<html>` carries, if any. */
export function htmlTheme(page: string): string | undefined {
  return /<html[^>]*\sdata-theme="([^"]*)"/.exec(page)?.[1];
}
