<script lang="ts">
  // PROTOTYPE: times as an app would show them, per format and undo variant.
  // `zone` undefined draws Zulu. `live` adds the undo / offer line.
  import {
    chosen,
    prefs,
    samples,
    zulu,
    local,
    city,
    shortName,
    saveTimeZone,
    clearTimeZone,
    followDevice,
  } from "./prefs.svelte.ts";
  import { focus } from "./cls.ts";

  let { zone, live = false }: { zone: string | undefined; live?: boolean } =
    $props();

  const link = `min-h-11 cursor-pointer rounded-sm text-link underline underline-offset-4 hover:decoration-2 ${focus}`;
</script>

{#if live && chosen.undo === "B"}
  <p
    class="mb-2 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground"
  >
    {#if zone}
      <span>Times in {city(zone)} time ({shortName(zone)}) ·</span>
      <button type="button" class={link} onclick={clearTimeZone}
        >Show times in Zulu</button
      >
    {:else}
      <span>Times are in Zulu ·</span>
      <button
        type="button"
        class={link}
        onclick={() =>
          chosen.wording === "D" ? followDevice() : saveTimeZone(prefs.device)}
        >Show them in {city(prefs.device)} time?</button
      >
    {/if}
  </p>
{/if}

<ul class="divide-y divide-border rounded-lg border border-border bg-card">
  {#each samples as s (s.title)}
    {@const zs = zulu(s.start)}
    {@const ze = zulu(s.end)}
    <li class="p-3">
      <p
        class="text-xs font-semibold tracking-wider text-muted-foreground uppercase"
      >
        {s.kind}
      </p>
      <p class="font-semibold text-foreground">{s.title}</p>
      {#if !zone}
        <p class="font-mono text-sm">{zs.day}, {zs.time}–{ze.time}</p>
      {:else}
        {@const ls = local(s.start, zone)}
        {@const le = local(s.end, zone)}
        {#if chosen.format === "A"}
          <p class="text-sm">
            {ls.day}, {ls.time.replace(/ \S+$/, "")}–{le.time}
          </p>
        {:else if chosen.format === "B"}
          <p class="text-sm">
            {ls.day}, {ls.time.replace(/ \S+$/, "")}–{le.time}
            <span class="font-mono text-muted-foreground"
              >· {zs.time}–{ze.time}</span
            >
          </p>
        {:else}
          <p class="font-mono text-sm">{zs.day}, {zs.time}–{ze.time}</p>
          <p class="text-xs text-muted-foreground">
            {ls.day}, {ls.time.replace(/ \S+$/, "")}–{le.time}
          </p>
        {/if}
      {/if}
    </li>
  {/each}
</ul>
