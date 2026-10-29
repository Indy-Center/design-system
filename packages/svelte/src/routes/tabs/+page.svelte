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

<Schemes>
  <Tabs label="Admin" {items} current="#users" />
</Schemes>
