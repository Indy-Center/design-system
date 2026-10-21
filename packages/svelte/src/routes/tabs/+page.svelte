<script lang="ts">
  import { Tabs } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const items = [
    { href: "#overview", label: "Overview" },
    { href: "#users", label: "Users" },
    { href: "#events", label: "Events" },
    { href: "#feedback", label: "Feedback" },
    { href: "#partners", label: "Partners" },
    { href: "#settings", label: "Settings" },
  ];
</script>

<svelte:head><title>Tabs · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Tabs</h1>

<Schemes>
  <Tabs label="Admin" {items} current="#users" />
</Schemes>
