<script lang="ts">
  // PROTOTYPE: the time-zone setting in the user menu, per wording variant.
  // Writes the cookie only on the member's click.
  import {
    chosen,
    prefs,
    saveTimeZone,
    clearTimeZone,
    followDevice,
    city,
    shortName,
    ZONES,
  } from "./prefs.svelte.ts";
  import { seg, segGroup, focus } from "./cls.ts";
  import Note from "./Note.svelte";
  import Icon from "./Icon.svelte";

  const id = $props.id();
  let saved = $state(false);
  const local = $derived(prefs.zone !== undefined);

  function set(on: boolean) {
    if (on) saveTimeZone(prefs.device);
    else clearTimeZone();
    saved = true;
  }

  // Wording D: three rows, like the colour scheme.
  const mode = $derived(
    prefs.zone === undefined ? "zulu" : prefs.follow ? "device" : "other",
  );
  let picking = $state(false);
  const showPicker = $derived(picking || mode === "other");
  function pickMode(m: "zulu" | "device") {
    if (m === "zulu") clearTimeZone();
    else followDevice();
    picking = false;
    saved = true;
  }
  function pickZone(e: Event) {
    const z = (e.currentTarget as HTMLSelectElement).value;
    if (z) {
      saveTimeZone(z);
      saved = true;
    }
  }
  const rowCls = (on: boolean) =>
    `flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-1 text-sm ${focus} ${
      on
        ? "bg-muted font-semibold text-foreground"
        : "text-foreground-soft hover:bg-muted hover:text-foreground"
    }`;
</script>

{#if chosen.wording === "D"}
  <div role="group" aria-label="Time zone" class="space-y-0.5 px-3 pt-1">
    <button
      type="button"
      aria-pressed={mode === "zulu"}
      onclick={() => pickMode("zulu")}
      class={rowCls(mode === "zulu")}
    >
      <Icon name="earth" />
      <span class="flex-1 text-left">Zulu</span>
      {#if mode === "zulu"}<Icon name="check" />{/if}
    </button>
    <button
      type="button"
      aria-pressed={mode === "device"}
      onclick={() => pickMode("device")}
      class={rowCls(mode === "device")}
    >
      <Icon name="device" />
      <span class="flex-1 text-left"
        >Use my device's time zone
        <span class="block text-xs font-normal text-muted-foreground"
          >{city(prefs.device)} ({shortName(prefs.device)})</span
        ></span
      >
      {#if mode === "device"}<Icon name="check" />{/if}
    </button>
    <button
      type="button"
      aria-pressed={mode === "other"}
      aria-expanded={showPicker}
      aria-controls="tz-pick-{id}"
      onclick={() => (picking = !picking || mode === "other")}
      class={rowCls(mode === "other")}
    >
      <Icon name="pin" />
      <span class="flex-1 text-left"
        >Another time zone
        {#if mode === "other"}
          <span class="block text-xs font-normal text-muted-foreground"
            >{city(prefs.zone!)} ({shortName(prefs.zone!)})</span
          >
        {/if}</span
      >
      {#if mode === "other"}<Icon name="check" />{/if}
    </button>
    <div id="tz-pick-{id}" hidden={!showPicker} class="pb-1 pl-10">
      <label class="sr-only" for="tz-sel-{id}">Time zone</label>
      <select
        id="tz-sel-{id}"
        value={mode === "other" ? prefs.zone : ""}
        onchange={pickZone}
        class="min-h-11 w-full rounded-md border border-border bg-background px-2 text-sm text-foreground {focus}"
      >
        <option value="" disabled>Pick a time zone…</option>
        {#each ZONES as z (z)}
          <option value={z}>{city(z)} ({shortName(z)})</option>
        {/each}
      </select>
    </div>
  </div>
{:else if chosen.wording === "A"}
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
