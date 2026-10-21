<script lang="ts">
  import { AppsMenu } from "../../lib/index.ts";
  import { apps } from "../../playground/chrome.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>AppsMenu · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  AppsMenu
</h1>

<!-- Room under each, for the open list. -->
<Schemes>
  <div class="flex min-h-96 justify-end">
    <AppsMenu {apps} current="https://training.flyindycenter.com" />
  </div>
</Schemes>
