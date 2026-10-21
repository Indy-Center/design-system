<script lang="ts">
  import { mdiAccountGroup, mdiRadar } from "@mdi/js";
  import { Icon, Panel, Text } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  const controllers = [
    ["IND_CTR", "Hayden Young", "124.875"],
    ["IND_APP", "Sam Carter", "127.150"],
    ["CMH_TWR", "Alex Rivera", "132.700"],
  ];
</script>

<svelte:head><title>Panel · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Panel</h1>

<p class="mb-4">
  Each panel's title is an <code>h3</code>, under the scheme's
  <code>h2</code>; it looks the same at any level.
</p>

<Schemes>
  <div class="grid gap-3">
    <Panel title="Controllers online" level={3} flush>
      {#snippet icon()}<Icon path={mdiRadar} />{/snippet}
      <ul class="divide-y divide-border">
        {#each controllers as [callsign, name, freq] (callsign)}
          <li class="flex items-center justify-between gap-3 px-4 py-3">
            <span>
              <span class="font-mono text-sm font-semibold text-foreground"
                >{callsign}</span
              >
              <span class="block text-sm text-muted-foreground">{name}</span>
            </span>
            <span class="font-mono text-sm">{freq}</span>
          </li>
        {/each}
      </ul>
    </Panel>
    <Panel title="Mentors" level={3}>
      {#snippet icon()}<Icon path={mdiAccountGroup} />{/snippet}
      <Text tone="muted">No mentors are available this week.</Text>
    </Panel>
  </div>
</Schemes>
