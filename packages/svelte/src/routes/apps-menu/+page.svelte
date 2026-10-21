<script lang="ts">
  // The menu belongs in the dark header and has no background of its own,
  // so it is shown in a dark header band on a light page and on a dark
  // page, rather than in <Schemes>' bare light column. Its tests cover all
  // three schemes.
  import { AppsMenu, INDY_CENTER_APPS } from "../../lib/index.ts";

  const label =
    "mb-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase";
</script>

<svelte:head><title>AppsMenu · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  AppsMenu
</h1>

<div class="grid gap-4 lg:grid-cols-2">
  {#each ["Light page", "Dark page"] as name}
    <!-- Room under each, for the open list. -->
    <section
      data-theme={name === "Dark page" ? "dark" : undefined}
      class="min-h-96 rounded-lg border border-border bg-background p-4"
    >
      <h2 class={label}>{name}</h2>
      <header
        data-theme="dark"
        class="flex justify-end rounded-md bg-background p-2"
      >
        <AppsMenu
          apps={INDY_CENTER_APPS}
          current="https://training.flyindycenter.com"
        />
      </header>
    </section>
  {/each}
</div>
