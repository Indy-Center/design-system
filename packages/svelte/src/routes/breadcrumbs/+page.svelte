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

<Schemes>
  <Breadcrumbs {items} />
</Schemes>
