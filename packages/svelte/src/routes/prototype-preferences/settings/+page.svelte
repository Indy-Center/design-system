<script lang="ts">
  // PROTOTYPE: a stub settings page. Holds the time zone in "where" B and C;
  // C adds a zone picker and the (fake) profile save.
  import {
    chosen,
    prefs,
    variantQuery,
    saveTimeZone,
    clearTimeZone,
    followDevice,
    saveToProfile,
    ZONES,
    city,
    shortName,
    NOTE,
  } from "../prefs.svelte.ts";
  import { button, focus } from "../cls.ts";
  import Note from "../Note.svelte";
  import SchemeControl from "../SchemeControl.svelte";
  import TimeSamples from "../TimeSamples.svelte";
  import Readout from "../Readout.svelte";
  import { Link } from "../../../lib/index.ts";

  type Mode = "zulu" | "device" | "local";
  const current = (): Mode =>
    !prefs.zone ? "zulu" : prefs.follow ? "device" : "local";
  let mode = $state<Mode>(current());
  let pick = $state(prefs.zone ?? prefs.device);
  let toProfile = $state(true);
  let status = $state("");
  let saved = $state(false);

  $effect(() => {
    // Follow the browser's read after mount, until the member edits.
    if (!saved) {
      mode = current();
      pick = prefs.zone ?? prefs.device;
    }
  });

  async function save() {
    if (mode === "local") saveTimeZone(pick);
    else if (mode === "device") followDevice();
    else clearTimeZone();
    saved = true;
    if (toProfile) {
      status = "Saving to your profile…";
      // The profile keeps "device" as is: each browser uses its own zone.
      await saveToProfile(
        mode === "local" ? pick : mode === "device" ? "device" : undefined,
      );
      status = "Saved to your profile: any browser you sign in on will use it.";
    } else status = "Saved on this browser.";
  }

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
      <fieldset class="space-y-1">
        <legend class="mb-1 text-sm text-muted-foreground">Show times in</legend
        >
        <label class="flex min-h-11 items-center gap-2">
          <input type="radio" bind:group={mode} value="zulu" class={focus} />
          Zulu (UTC), as controllers use
        </label>
        {#if chosen.wording === "D"}
          <label class="flex min-h-11 items-center gap-2">
            <input
              type="radio"
              bind:group={mode}
              value="device"
              class={focus}
            />
            My device's time zone ({city(prefs.device)}, {shortName(
              prefs.device,
            )}), even when I travel
          </label>
        {/if}
        <label class="flex min-h-11 flex-wrap items-center gap-2">
          <input type="radio" bind:group={mode} value="local" class={focus} />
          {chosen.wording === "D" ? "Another time zone:" : "My time zone:"}
          <select
            bind:value={pick}
            onchange={() => (mode = "local")}
            class="min-h-11 rounded-md border border-border bg-background px-2 text-foreground {focus}"
          >
            {#each ZONES as z (z)}
              <option value={z}
                >{city(z)} ({shortName(z)}){z === prefs.device
                  ? " · this device"
                  : ""}</option
              >
            {/each}
          </select>
        </label>
      </fieldset>
      <label class="mt-2 flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={toProfile} class={focus} />
        Also save it to my profile, for every browser I sign in on
      </label>
      <div class="-mx-3">
        <Note
          text={NOTE + (toProfile ? " And to your Indy Center profile." : "")}
          {saved}
        />
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <button type="button" class={button} onclick={save}>Save</button>
        <p class="text-sm text-muted-foreground" aria-live="polite">{status}</p>
      </div>
      <h3 class="mt-4 mb-2 text-sm font-semibold text-foreground">Preview</h3>
      <TimeSamples
        zone={mode === "local"
          ? pick
          : mode === "device"
            ? prefs.device
            : undefined}
      />
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
