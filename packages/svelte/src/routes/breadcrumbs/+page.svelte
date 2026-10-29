<script lang="ts">
  import { Breadcrumbs } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const items = [
    { href: "#library", label: "Library" },
    { href: "#sops", label: "SOPs" },
    { href: "#zid-center", label: "ZID Center SOP" },
    { href: "#3-2", label: "3-2 Radar handoffs" },
  ];
</script>

<svelte:head><title>Breadcrumbs · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Breadcrumbs
</h1>

<Schemes>
  <Breadcrumbs {items} />
</Schemes>
