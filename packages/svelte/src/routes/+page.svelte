<script lang="ts">
  // Lists every component's page, src/routes/<name>/+page.svelte, so adding
  // a component never means editing this file.
  import { Link } from "../lib/index.ts";

  const pages = Object.keys(import.meta.glob("./*/+page.svelte"))
    .map((path) => path.split("/")[1])
    .sort();
</script>

<svelte:head><title>Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Components
</h1>
<ul class="space-y-2">
  {#each pages as name (name)}
    <li><Link href="/{name}">{name}</Link></li>
  {/each}
</ul>
