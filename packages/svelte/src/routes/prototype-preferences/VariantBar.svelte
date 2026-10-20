<script lang="ts">
  // PROTOTYPE: pick a variant per point; "rec." marks the recommendation.
  import {
    points,
    chosen,
    choose,
    prefs,
    ZONES,
    city,
    pretendDevice,
  } from "./prefs.svelte.ts";
  import { seg, focus } from "./cls.ts";

  let open = $state(true);
</script>

<details bind:open class="mb-6 rounded-lg border border-border bg-card text-sm">
  <summary
    class="flex min-h-11 cursor-pointer items-center px-3 font-semibold text-foreground {focus}"
  >
    Variants (“rec.” marks the recommendation)
  </summary>
  <div class="grid gap-3 border-t border-border p-3 md:grid-cols-2">
    {#each points as p (p.key)}
      {@const v = p.variants.find((o) => o.key === chosen[p.key])}
      <div>
        <p id="pt-{p.key}" class="font-semibold text-foreground">{p.name}</p>
        <div role="group" aria-labelledby="pt-{p.key}" class="mt-1 flex gap-1">
          {#each p.variants as o (o.key)}
            <button
              type="button"
              aria-pressed={chosen[p.key] === o.key}
              class="{seg(chosen[p.key] === o.key)} border border-border"
              onclick={() => choose(p.key, o.key)}
              >{o.key}{o.key === p.recommend ? " rec." : ""}</button
            >
          {/each}
        </div>
        <p class="mt-1 text-muted-foreground">{v?.note}</p>
      </div>
    {/each}
    <div>
      <label class="flex flex-wrap items-center gap-2 text-muted-foreground">
        Pretend this device is in
        <select
          value={prefs.device}
          onchange={(e) => pretendDevice(e.currentTarget.value)}
          class="min-h-11 rounded-md border border-border bg-background px-2 text-foreground {focus}"
        >
          {#each ZONES as z (z)}<option value={z}>{city(z)}</option>{/each}
        </select>
      </label>
      <p class="text-xs text-muted-foreground">
        Travel: “Use my device's time zone” catches up on the next page.
      </p>
    </div>
  </div>
</details>
