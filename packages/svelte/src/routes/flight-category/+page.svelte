<script lang="ts">
  import { FLIGHT_CATEGORIES, FlightCategory } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>FlightCategory · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  FlightCategory
</h1>

<Schemes>
  <div class="space-y-4 text-foreground">
    <div class="flex flex-wrap gap-2">
      {#each FLIGHT_CATEGORIES as category (category)}
        <FlightCategory {category} />
      {/each}
    </div>
    <ul class="space-y-2 rounded-md bg-card p-3 text-sm">
      <li>
        <span class="font-mono">KIND</span> 2251Z <FlightCategory
          category="VFR"
        />
      </li>
      <li>
        <span class="font-mono">KLEX</span> 2254Z <FlightCategory
          category="MVFR"
        />
      </li>
      <li>
        <span class="font-mono">KCVG</span> 2252Z <FlightCategory
          category="IFR"
        />
      </li>
      <li>
        <span class="font-mono">KSDF</span> 2253Z <FlightCategory
          category="LIFR"
        />
      </li>
    </ul>
  </div>
</Schemes>
