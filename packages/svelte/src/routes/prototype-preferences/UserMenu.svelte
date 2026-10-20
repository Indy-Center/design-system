<script lang="ts">
  // PROTOTYPE: a copy of the chrome prototype's user menu
  // (community-website prototype/chrome, UserMenuBody.svelte), on the roles,
  // with the time zone added per the "where" variant.
  import {
    chosen,
    prefs,
    variantQuery,
    city,
    shortName,
  } from "./prefs.svelte.ts";
  import { row, groupLabel } from "./cls.ts";
  import ZoneControl from "./ZoneControl.svelte";
  import SchemeControl from "./SchemeControl.svelte";

  const chip =
    "inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-foreground";
</script>

<div
  data-theme="dark"
  class="w-full max-w-80 rounded-xl border border-border bg-card shadow-lg"
>
  <div class="flex items-center gap-3 px-3 py-3">
    <span
      aria-hidden="true"
      class="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-heading font-semibold text-primary-foreground"
      >JD</span
    >
    <div>
      <p class="text-sm font-semibold text-foreground">Jordan Doe</p>
      <p class="font-mono text-xs text-muted-foreground">CID 1234567</p>
      <p class="mt-1 flex gap-1">
        <span class={chip} title="ATC rating: Senior Student"
          ><span class="sr-only">ATC rating</span>S3</span
        >
        <span class={chip} title="Pilot rating: Private Pilot"
          ><span class="sr-only">Pilot rating</span>P1</span
        >
      </p>
    </div>
  </div>

  <ul class="space-y-1 border-t border-border p-2">
    <li>
      <a href="/prototype-preferences{variantQuery()}" class={row}>My profile</a
      >
    </li>
    <li>
      <a href="/prototype-preferences/settings{variantQuery()}" class={row}>
        <span class="flex-1">Settings</span>
        {#if chosen.where === "B"}
          <span class="text-xs text-muted-foreground"
            >Times: {prefs.zone ? shortName(prefs.zone) : "Zulu"}</span
          >
        {/if}
      </a>
    </li>
  </ul>

  {#if chosen.where !== "B"}
    <div class="border-t border-border p-2">
      <p class={groupLabel}>Time zone</p>
      <ZoneControl />
      {#if chosen.where === "C" && chosen.wording !== "D"}
        <a
          href="/prototype-preferences/settings{variantQuery()}"
          class="{row} text-xs"
          >Pick another zone{prefs.zone ? ` (now ${city(prefs.zone)})` : ""}</a
        >
      {/if}
    </div>
  {/if}

  <div class="border-t border-border p-2">
    <SchemeControl />
  </div>

  <div class="border-t border-border p-2">
    <button type="button" class="{row} cursor-pointer text-destructive"
      >Sign out</button
    >
  </div>
</div>
