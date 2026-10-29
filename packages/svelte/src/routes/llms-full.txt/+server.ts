// The whole site in one file, for agents. Built once, at build.
import { llmsFullTxt } from "../../playground/llms.ts";

export const prerender = true;

export const GET = () =>
  new Response(llmsFullTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
