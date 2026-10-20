<script lang="ts">
  // PROTOTYPE: the time-zone setting in the user menu, per wording variant.
  // Writes the cookie only on the member's click.
  import {
    chosen,
    prefs,
    saveTimeZone,
    clearTimeZone,
    city,
    shortName,
  } from "./prefs.svelte.ts";
  import { seg, segGroup, focus } from "./cls.ts";
  import Note from "./Note.svelte";

  const id = $props.id();
  let saved = $state(false);
  const local = $derived(prefs.zone !== undefined);

  function set(on: boolean) {
    if (on) saveTimeZone(prefs.device);
    else clearTimeZone();
    saved = true;
  }
</script>

{#if chosen.wording === "A"}
  <div class="flex min-h-11 items-center justify-between gap-3 px-3 text-sm">
    <div>
      <span id="tz-{id}" class="text-foreground-soft">Local times</span>
      <p class="text-xs text-muted-foreground">
        {local
          ? `${city(prefs.zone!)} (${shortName(prefs.zone!)})`
          : "Off: times are in Zulu"}
      </p>
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={local}
      aria-labelledby="tz-{id}"
      onclick={() => set(!local)}
      class="relative inline-flex min-h-11 min-w-11 cursor-pointer items-center {focus} rounded-full"
    >
      <span
        class="block h-6 w-11 rounded-full border border-border transition-colors {local
          ? 'bg-primary'
          : 'bg-background'}"
      ></span>
      <span
        class="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-foreground transition-all {local
          ? 'left-6'
          : 'left-1'}"
      ></span>
    </button>
  </div>
{:else if chosen.wording === "B"}
  <div class="flex min-h-11 items-center justify-between gap-3 px-3 text-sm">
    <span id="tz-{id}" class="text-foreground-soft">Times</span>
    <div role="group" aria-labelledby="tz-{id}" class={segGroup}>
      <button
        type="button"
        aria-pressed={!local}
        class={seg(!local)}
        onclick={() => set(false)}>Zulu</button
      >
      <button
        type="button"
        aria-pressed={local}
        class={seg(local)}
        onclick={() => set(true)}
        >Local{local ? ` (${shortName(prefs.zone!)})` : ""}</button
      >
    </div>
  </div>
{:else}
  <div class="px-3 py-2 text-sm">
    {#if local}
      <p class="text-foreground-soft">
        Times are in {city(prefs.zone!)} time ({shortName(prefs.zone!)}).
      </p>
      <button
        type="button"
        onclick={() => set(false)}
        class="min-h-11 cursor-pointer rounded-sm text-link underline underline-offset-4 hover:decoration-2 {focus}"
        >Show times in Zulu</button
      >
    {:else}
      <p class="text-foreground-soft">Times are in Zulu.</p>
      <button
        type="button"
        onclick={() => set(true)}
        class="min-h-11 cursor-pointer rounded-sm text-left text-link underline underline-offset-4 hover:decoration-2 {focus}"
        >Show them in {city(prefs.device)} time?</button
      >
    {/if}
  </div>
{/if}
<Note {saved} />
