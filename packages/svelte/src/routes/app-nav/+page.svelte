<script lang="ts">
  // AppNav belongs in the dark header and has no background of its own, so
  // it is shown in a dark header band on a light page and on a dark page,
  // rather than in <Schemes>' bare light column. Its tests cover all three
  // schemes. The bar is a row across a wide header, so it shows from lg,
  // where the header uses it.
  import { AppNav } from "../../lib/index.ts";
  import { hubNav } from "../../playground/chrome.ts";

  const label =
    "mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase";
  const band = "rounded-md bg-background p-2";
</script>

<svelte:head><title>AppNav · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">AppNav</h1>

<div class="grid gap-4">
  {#each ["Light page", "Dark page"] as name}
    <section
      data-theme={name === "Dark page" ? "dark" : undefined}
      class="rounded-lg border border-border bg-background p-4"
    >
      <h2 class={label}>{name}</h2>

      <h3 class="mb-2 text-sm font-medium text-foreground">Bar</h3>
      <!-- Room under it, for a group's panel. -->
      <div class="mb-6 lg:min-h-60">
        <header data-theme="dark" class={[band, "max-lg:hidden"]}>
          <AppNav items={hubNav} current="/staff" />
        </header>
        <p class="text-sm lg:hidden">
          The bar is for screens 1024px and wider. Widen the window to see it.
        </p>
      </div>

      <h3 class="mb-2 text-sm font-medium text-foreground">Phone menu</h3>
      <header data-theme="dark" class={[band, "max-w-sm"]}>
        <AppNav items={hubNav} current="/staff" layout="menu" />
      </header>
    </section>
  {/each}
</div>
