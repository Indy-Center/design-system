<script lang="ts">
  // PROTOTYPE: seeds the shared state from the server's cookie read, then
  // the browser's, and the variants from ?v=.
  import { page } from "$app/state";
  import { onMount, type Snippet } from "svelte";
  import { prefs, readBrowser, readVariants } from "./prefs.svelte.ts";

  let {
    data,
    children,
  }: {
    data: { zone: string | undefined; scheme: "light" | "dark" | "device" };
    children: Snippet;
  } = $props();

  prefs.zone = data.zone;
  prefs.scheme = data.scheme;
  readVariants(page.url);
  onMount(readBrowser);
</script>

<p
  class="mb-4 rounded-md border border-warning px-3 py-2 text-sm text-foreground"
>
  Prototype (ticket 11): throwaway. Cookies are written only when you click; the
  profile save is faked.
</p>
{@render children()}
