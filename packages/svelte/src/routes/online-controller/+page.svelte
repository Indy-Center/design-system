<script lang="ts">
  import {
    groupByPosition,
    OnlineController,
    setPositions,
  } from "../../lib/index.ts";
  import { samplePositions } from "../../playground/positions.ts";
  import Schemes from "../../playground/Schemes.svelte";

  // An app's layout sets them from the CMS catalogue's positions.
  setPositions(() => samplePositions);

  const minutesAgo = (minutes: number) =>
    new Date(Date.now() - minutes * 60_000);
  // A Zulu time an hour or so from now, as a controller would write it.
  const zuluFromNow = (minutes: number) => {
    const at = new Date(Date.now() + minutes * 60_000);
    const hh = String(at.getUTCHours()).padStart(2, "0");
    const mm = String(at.getUTCMinutes()).padStart(2, "0");
    return `${hh}${mm}`;
  };

  // As an app's server load would give them, one login each.
  const online = [
    {
      callsign: "IND_83_CTR",
      name: "Jordan Sample",
      cid: 1000001,
      loggedInAt: minutesAgo(83),
      info: ["Indy Center, Falmouth sector.", `Off at ${zuluFromNow(90)}z`],
    },
    {
      callsign: "LEX_E_APP",
      name: "Alex Example",
      cid: 1000002,
      loggedInAt: minutesAgo(30),
      info: "Lexington Approach",
      bookingEnd: new Date(Date.now() + 150 * 60_000),
    },
    {
      callsign: "IND_831_CTR",
      name: "Sam",
      cid: 1000003,
      loggedInAt: minutesAgo(5),
      info: "Relief for IND_83_CTR",
    },
    {
      callsign: "CMH_LCE",
      name: "Pat Placeholder",
      cid: 1000004,
      loggedInAt: minutesAgo(9),
      info: "Runway 23 in use, ATIS on 128.82",
    },
  ];

  const groups = groupByPosition(online, samplePositions);
</script>

<Schemes>
  <div class="space-y-6">
    <ul class="divide-y divide-border">
      {#each groups as group (group.callsign)}
        <li class="py-2.5">
          <OnlineController
            callsign={group.callsign}
            positionId={group.position?.id}
            members={group.logins}
          />
        </li>
      {/each}
    </ul>
    <div class="rounded-md bg-card p-3">
      <OnlineController callsign="IND_83_CTR" members={[online[0]]} showCid />
    </div>
  </div>
</Schemes>
