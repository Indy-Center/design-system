<script lang="ts">
  // PROTOTYPE: the colour-scheme control, per scheme variant. Uses the real
  // saveColorScheme, and the prototype clearColorScheme for the device.
  import {
    chosen,
    prefs,
    setScheme,
    type SchemeChoice,
  } from "./prefs.svelte.ts";
  import { seg, segGroup, focus } from "./cls.ts";
  import Note from "./Note.svelte";
  import Icon from "./Icon.svelte";

  const id = $props.id();
  let saved = $state(false);
  function pick(c: SchemeChoice) {
    setScheme(c);
    saved = true;
  }
  const three: [SchemeChoice, string, "sun" | "moon" | "device"][] = [
    ["light", "Light", "sun"],
    ["dark", "Dark", "moon"],
    ["device", "Use my device's setting", "device"],
  ];
</script>

{#if chosen.scheme === "A"}
  <fieldset class="px-3 pt-2">
    <legend class="text-sm text-foreground-soft">Colour scheme</legend>
    <div class="mt-1 space-y-0.5">
      {#each three as [key, label, icon] (key)}
        <button
          type="button"
          aria-pressed={prefs.scheme === key}
          onclick={() => pick(key)}
          class="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-sm {focus} {prefs.scheme ===
          key
            ? 'bg-muted font-semibold text-foreground'
            : 'text-foreground-soft hover:bg-muted hover:text-foreground'}"
        >
          <Icon name={icon} />
          <span class="flex-1 text-left">{label}</span>
          {#if prefs.scheme === key}<Icon name="check" />{/if}
        </button>
      {/each}
    </div>
  </fieldset>
{:else if chosen.scheme === "B"}
  <div class="flex min-h-11 items-center justify-between gap-3 px-3 text-sm">
    <span id="cs-{id}" class="text-foreground-soft">Colour scheme</span>
    <div role="group" aria-labelledby="cs-{id}" class={segGroup}>
      {#each three.slice(0, 2) as [key, label, icon] (key)}
        <button
          type="button"
          aria-pressed={prefs.scheme === key}
          class={seg(prefs.scheme === key)}
          onclick={() => pick(key)}><Icon name={icon} />{label}</button
        >
      {/each}
    </div>
  </div>
  {#if prefs.scheme !== "device"}
    <div class="px-3">
      <button
        type="button"
        onclick={() => pick("device")}
        class="min-h-11 cursor-pointer rounded-sm text-sm text-link underline underline-offset-4 hover:decoration-2 {focus}"
        >Use my device's setting</button
      >
    </div>
  {/if}
{:else}
  <div
    class="flex min-h-11 flex-wrap items-center justify-between gap-2 px-3 text-sm"
  >
    <span id="cs-{id}" class="text-foreground-soft">Colour scheme</span>
    <div role="group" aria-labelledby="cs-{id}" class={segGroup}>
      {#each three as [key, label, icon] (key)}
        <button
          type="button"
          aria-pressed={prefs.scheme === key}
          class={seg(prefs.scheme === key)}
          onclick={() => pick(key)}
          ><Icon name={icon} />{key === "device" ? "Device" : label}</button
        >
      {/each}
    </div>
  </div>
{/if}
<Note {saved} />
