<script lang="ts">
  import { mdiCellphone, mdiEarth, mdiMapMarkerOutline } from "@mdi/js";
  import { onMount, tick } from "svelte";
  import type { HTMLFieldsetAttributes } from "svelte/elements";
  import ChoiceRow from "../preferenceControl/ChoiceRow.svelte";
  import WhatsSaved from "../preferenceControl/WhatsSaved.svelte";
  import type { TimeZoneChoice } from "../timeZone/timeZone.js";
  import { getTimeZone } from "../timeZone/timeZoneContext.svelte.js";
  import {
    zoneGroups,
    zoneLabel,
    type ZoneGroup,
  } from "../timeZone/zoneNames.js";
  import { textControlClasses } from "../formControl/formControl.js";

  type Props = Omit<HTMLFieldsetAttributes, "children">;

  let { class: className, ...rest }: Props = $props();

  const timeZone = getTimeZone();
  const id = $props.id();

  // The device's zone and the picker's list are the browser's; the server
  // draws neither, so hydration matches.
  let mounted = $state(false);
  let groups = $state<ZoneGroup[]>([]);
  onMount(() => {
    timeZone.mount();
    groups = zoneGroups();
    mounted = true;
  });

  // With nothing saved, times follow the device, so that row is ticked.
  const kind = $derived(timeZone.choice?.kind ?? "device");
  // Before mount, the zone the device was last seen in, if saved.
  const deviceZone = $derived(
    mounted
      ? timeZone.device
      : timeZone.choice?.kind === "device"
        ? timeZone.choice.zone
        : undefined,
  );
  const savedZone = $derived(
    timeZone.choice?.kind === "zone" ? timeZone.choice.zone : undefined,
  );

  // "Another time zone" opened on the choice then saved: it reads as the
  // choice, picker showing, until a zone is picked or the choice changes
  // (here or in another control on the page).
  let opened = $state.raw<{ on: TimeZoneChoice | undefined }>();
  const picking = $derived(!!opened && opened.on === timeZone.choice);
  // The row ticked; the picker shows while "Another time zone" is.
  const ticked = $derived(picking ? "zone" : kind);
  let picker = $state<HTMLSelectElement>();

  async function openPicker() {
    if (kind === "zone") return picker?.focus();
    if (picking) {
      opened = undefined;
      return;
    }
    opened = { on: timeZone.choice };
    await tick();
    picker?.focus();
  }

  // A saved zone under a name this browser doesn't list (Asia/Calcutta
  // for Asia/Kolkata) still shows as picked.
  function listed(zone: string): boolean {
    return groups.some((group) => group.zones.some((z) => z.zone === zone));
  }

  function pick(event: Event) {
    const zone = (event.currentTarget as HTMLSelectElement).value;
    if (zone) timeZone.choose({ kind: "zone", zone });
  }

  const note = $derived(
    timeZone.savesToProfile
      ? "Saved on this browser for a year, across flyindycenter.com, and to your Indy Center profile for every browser you sign in on."
      : "Saved on this browser for a year, across flyindycenter.com.",
  );
</script>

<fieldset {...rest} class={["min-w-0", className]}>
  <legend class="px-3 text-sm text-foreground-soft">Time zone</legend>
  <div class="mt-1 space-y-0.5">
    <ChoiceRow
      icon={mdiEarth}
      pressed={ticked === "zulu"}
      onclick={() => {
        opened = undefined;
        timeZone.choose({ kind: "zulu" });
      }}>Zulu</ChoiceRow
    >
    <ChoiceRow
      icon={mdiCellphone}
      pressed={ticked === "device"}
      onclick={() => {
        opened = undefined;
        timeZone.choose({ kind: "device" });
      }}
    >
      Use my device's time zone
      {#snippet detail()}{deviceZone ? zoneLabel(deviceZone) : ""}{/snippet}
    </ChoiceRow>
    <ChoiceRow
      icon={mdiMapMarkerOutline}
      pressed={ticked === "zone"}
      aria-controls="{id}-picker"
      onclick={openPicker}
    >
      Another time zone
      {#snippet detail()}{savedZone ? zoneLabel(savedZone) : ""}{/snippet}
    </ChoiceRow>
    <div id="{id}-picker" hidden={ticked !== "zone"} class="pb-1 pl-11">
      <select
        bind:this={picker}
        aria-label="Pick a time zone"
        value={savedZone ?? ""}
        onchange={pick}
        class={[textControlClasses, "w-full text-sm"]}
      >
        <option value="" disabled>Pick a time zone…</option>
        {#if savedZone && !listed(savedZone)}
          <option value={savedZone}>{zoneLabel(savedZone)}</option>
        {/if}
        {#each groups as group (group.region)}
          <optgroup label={group.region}>
            {#each group.zones as { zone, label } (zone)}
              <option value={zone}>{label}</option>
            {/each}
          </optgroup>
        {/each}
      </select>
    </div>
  </div>
  <WhatsSaved {note} />
</fieldset>
