<script lang="ts">
  // Served by the colour-scheme hook with `fallback: 'device'`, or 'dark'
  // with `?fallback=dark` (src/hooks.server.ts), so a choice holds after a
  // reload. The page hands the same fallback to setColorScheme, as an app's
  // root layout would.
  import { page } from "$app/state";
  import { ColorSchemeSetting, Link, setColorScheme } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  // The links below reload the page, so the hook serves the new fallback.
  const fallback =
    page.url.searchParams.get("fallback") === "dark" ? "dark" : "device";
  setColorScheme({ fallback });
</script>

<div class="mb-6 max-w-prose space-y-4">
  <p>
    A choice applies to the whole page at once, so Light and Dark turn the light
    columns below too; the dark ones stay dark. Reload, and the server serves
    it.
  </p>
  <p>
    Served with <code class="font-mono">fallback: '{fallback}'</code>.
    {#if fallback === "device"}
      "Use my device's setting" deletes the cookie and follows the device. Try
      <Link href="?fallback=dark" data-sveltekit-reload>the dark fallback</Link
      >, which hides it.
    {:else}
      The next page is dark with nothing saved, so following the device isn't
      offered. Try
      <Link href="/color-scheme-setting" data-sveltekit-reload
        >the device fallback</Link
      >.
    {/if}
  </p>
</div>

<Schemes>
  <ColorSchemeSetting />
</Schemes>
