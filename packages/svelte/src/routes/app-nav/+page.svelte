<script lang="ts">
  // The bar is a row across the header, too wide for <Schemes>' narrow
  // columns, so it is shown full width in a dark header band on a light
  // page and on a dark page. The phone menu fits them.
  import { AppNav } from "../../lib/index.ts";
  import { hubNav } from "../../playground/chrome.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const label =
    "mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase";
</script>

<svelte:head><title>AppNav · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">AppNav</h1>

<h2 class="mb-2 font-heading text-xl font-semibold text-foreground">Bar</h2>
<div class="mb-8 grid gap-4">
  {#each ["Light page", "Dark page"] as name}
    <section
      data-theme={name === "Dark page" ? "dark" : undefined}
      class="min-h-72 rounded-lg border border-border bg-background p-4"
    >
      <h3 class={label}>{name}</h3>
      <!-- Not clipped, so a group's panel can hang below it. The bar is
           for wide screens: on a phone it runs off the edge. -->
      <header data-theme="dark" class="rounded-md bg-background p-2">
        <AppNav items={hubNav} current="/staff" />
      </header>
    </section>
  {/each}
</div>

<h2 class="mb-2 font-heading text-xl font-semibold text-foreground">
  Phone menu
</h2>
<Schemes>
  <AppNav items={hubNav} current="/staff" layout="menu" />
</Schemes>
