// Every page with its one-line summary, for agents. Built once, at build.
import { llmsTxt } from "../../playground/llms.ts";

export const prerender = true;

export const GET = () =>
  new Response(llmsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
