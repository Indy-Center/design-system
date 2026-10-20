<script lang="ts">
  import { Icon } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  // From @mdi/js: mdiAirplane, mdiRadioTower, mdiAlert.
  const airplane =
    "M20.56 3.91C21.15 4.5 21.15 5.45 20.56 6.03L16.67 9.92L18.79 19.11L17.38 20.53L13.5 13.1L9.6 17L9.96 19.47L8.89 20.53L7.13 17.35L3.94 15.58L5 14.5L7.5 14.87L11.37 11L3.94 7.09L5.36 5.68L14.55 7.8L18.44 3.91C19 3.33 20 3.33 20.56 3.91Z";
  const radioTower =
    "M12,10A2,2 0 0,1 14,12C14,12.5 13.82,12.94 13.53,13.29L16.7,22H14.57L12,14.93L9.43,22H7.3L10.47,13.29C10.18,12.94 10,12.5 10,12A2,2 0 0,1 12,10M12,8A4,4 0 0,0 8,12C8,12.5 8.1,13 8.28,13.46L7.4,15.86C6.53,14.81 6,13.47 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12C18,13.47 17.47,14.81 16.6,15.86L15.72,13.46C15.9,13 16,12.5 16,12A4,4 0 0,0 12,8M12,4A8,8 0 0,0 4,12C4,14.36 5,16.5 6.64,17.94L5.92,19.94C3.54,18.11 2,15.23 2,12A10,10 0 0,1 12,2A10,10 0 0,1 22,12C22,15.23 20.46,18.11 18.08,19.94L17.36,17.94C19,16.5 20,14.36 20,12A8,8 0 0,0 12,4Z";
  const alert = "M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z";
</script>

<svelte:head><title>Icon · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Icon</h1>

<Schemes>
  <ul class="space-y-3">
    <li class="flex items-center gap-2">
      <Icon path={airplane} /> Departures (beside its words: no label)
    </li>
    <li class="flex items-center gap-2 text-xl text-foreground">
      <Icon path={radioTower} /> Indianapolis Center (1em of larger text)
    </li>
    <li class="flex items-center gap-2 text-warning">
      <Icon path={alert} label="Caution" size={24} /> 24px, labelled, in the warning
      role
    </li>
  </ul>
</Schemes>
