<script lang="ts">
  // The colour-scheme hook at work: src/hooks.server.ts serves this page
  // from the cookie, else the fallback. The header above stays dark.
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { COOKIE_NAME } from "../../lib/colorScheme/colorScheme.ts";
  import { Link, saveColorScheme, type ColorScheme } from "../../lib/index.ts";
  import { forgetColorScheme } from "../../playground/forgetColorScheme.ts";

  const fallback = $derived(
    page.url.searchParams.get("fallback") === "device" ? "device" : "dark",
  );

  // What the server and the device script left on <html>, and the cookie.
  let onHtml = $state<string>();
  let cookie = $state<string>();

  function read() {
    onHtml = document.documentElement.dataset.theme ?? "nothing (light)";
    cookie =
      document.cookie
        .split("; ")
        .find((pair) => pair.startsWith(`${COOKIE_NAME}=`))
        ?.slice(COOKIE_NAME.length + 1) ?? "nothing";
  }

  onMount(read);

  function choose(scheme: ColorScheme) {
    saveColorScheme(scheme);
    read();
  }

  // Playground only: back to no choice, so the fallback shows again.
  function forget() {
    forgetColorScheme();
    location.reload();
  }

  const button =
    "min-h-11 min-w-11 rounded-md border border-border bg-card px-4 font-semibold text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
</script>

<svelte:head><title>Colour scheme · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Colour scheme
</h1>

<div class="max-w-prose space-y-4">
  <p>
    Served with <code class="font-mono">fallback: '{fallback}'</code>. Try
    {#if fallback === "dark"}
      <Link href="?fallback=device">the device fallback</Link>.
    {:else}
      <Link href="/color-scheme">the dark fallback</Link>.
    {/if}
  </p>

  <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
    <dt class="font-semibold text-foreground">data-theme on html</dt>
    <dd class="font-mono" data-testid="on-html">{onHtml}</dd>
    <dt class="font-semibold text-foreground">Cookie</dt>
    <dd class="font-mono" data-testid="cookie">{cookie}</dd>
  </dl>

  <div class="flex flex-wrap gap-2">
    <button type="button" class={button} onclick={() => choose("light")}>
      Light
    </button>
    <button type="button" class={button} onclick={() => choose("dark")}>
      Dark
    </button>
    <button type="button" class={button} onclick={forget}>
      Forget my choice
    </button>
  </div>

  <p>
    A choice applies at once and is saved to the cookie; reload, and the server
    serves it. The header stays dark in both.
  </p>
</div>
