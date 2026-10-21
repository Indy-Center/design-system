<script lang="ts">
  import { mdiAccountGroup, mdiCalendar, mdiMessage } from "@mdi/js";
  import { ErrorPage, type ErrorPageLink } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const links: ErrorPageLink[] = [
    { label: "Events", href: "/events", icon: mdiCalendar },
    { label: "Roster", href: "/roster", icon: mdiAccountGroup },
    { label: "Feedback", href: "/feedback", icon: mdiMessage },
  ];
</script>

<svelte:head><title>ErrorPage · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  ErrorPage
</h1>

<!-- Each specimen has its own h1, as it would on its own page. -->
<Schemes>
  <ErrorPage
    status={404}
    message="Not Found"
    path="/events/spring-fly-in-2026"
    {links}
  />
</Schemes>

<div class="mt-4">
  <Schemes>
    <ErrorPage status={500} message="Internal Error" />
  </Schemes>
</div>
