<script lang="ts">
  // PROTOTYPE: a stub settings page. Holds the time zone in "where" B and C,
  // with the same control as the menu: a choice applies at once and goes to
  // the (fake) profile too.
  import { chosen, prefs, variantQuery } from "../prefs.svelte.ts";
  import ZoneControl from "../ZoneControl.svelte";
  import SchemeControl from "../SchemeControl.svelte";
  import TimeSamples from "../TimeSamples.svelte";
  import Readout from "../Readout.svelte";
  import { Link } from "../../../lib/index.ts";

  const h2 = "mb-2 font-heading text-xl font-semibold text-foreground";
</script>

<svelte:head
  ><title>Settings (prototype) · Centerline playground</title></svelte:head
>

<p class="mb-2">
  <Link href="/prototype-preferences{variantQuery()}">← Back to the menu</Link>
</p>
<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Settings
</h1>

<div class="grid max-w-3xl gap-6">
  <section
    aria-labelledby="tz-h"
    class="rounded-lg border border-border bg-card p-4"
  >
    <h2 id="tz-h" class={h2}>Time zone</h2>
    {#if chosen.where === "A"}
      <p>In variant A the time zone is set from the user menu only.</p>
    {:else}
      <div class="-mx-3 max-w-80"><ZoneControl /></div>
      <h3 class="mt-4 mb-2 text-sm font-semibold text-foreground">Preview</h3>
      <TimeSamples zone={prefs.zone} />
    {/if}
  </section>

  <section
    aria-labelledby="cs-h"
    class="rounded-lg border border-border bg-card p-4"
  >
    <h2 id="cs-h" class={h2}>Colour scheme</h2>
    <div class="-mx-3 max-w-80"><SchemeControl /></div>
  </section>

  <Readout />
</div>
