<script lang="ts">
  // PROTOTYPE (ticket 11): the user menu with the time-zone and colour-scheme
  // choices, and times as a page shows them.
  import { prefs } from "./prefs.svelte.ts";
  import VariantBar from "./VariantBar.svelte";
  import UserMenu from "./UserMenu.svelte";
  import TimeSamples from "./TimeSamples.svelte";
  import Readout from "./Readout.svelte";

  const h2 = "mb-2 font-heading text-xl font-semibold text-foreground";
</script>

<svelte:head
  ><title>Preferences prototype · Centerline playground</title></svelte:head
>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Time zone and colour scheme
</h1>

<VariantBar />

<div class="grid gap-6 lg:grid-cols-[20rem_1fr]">
  <section aria-labelledby="menu-h">
    <h2 id="menu-h" class={h2}>User menu</h2>
    <UserMenu />
  </section>

  <div class="space-y-6">
    <section aria-labelledby="now-h">
      <h2 id="now-h" class={h2}>Upcoming, as this page shows it</h2>
      <TimeSamples zone={prefs.zone} live />
    </section>

    <section aria-labelledby="ba-h">
      <h2 id="ba-h" class={h2}>Before and after</h2>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <p class="mb-1 text-sm text-muted-foreground">
            Before: no cookie, Zulu
          </p>
          <TimeSamples zone={undefined} />
        </div>
        <div>
          <p class="mb-1 text-sm text-muted-foreground">
            After: {prefs.device}
          </p>
          <TimeSamples zone={prefs.device} />
        </div>
      </div>
    </section>

    <section aria-labelledby="cookie-h">
      <h2 id="cookie-h" class={h2}>Saved now</h2>
      <Readout />
    </section>
  </div>
</div>
