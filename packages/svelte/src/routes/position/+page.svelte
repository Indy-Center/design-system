<script lang="ts">
  import { DescriptionList, Position, setPositions } from "../../lib/index.ts";
  import { samplePositions } from "../../playground/positions.ts";
  import Schemes from "../../playground/Schemes.svelte";

  // An app's layout sets them from fetchPositions("ZID").
  setPositions(() => samplePositions);

  const pilots = ["airport", "radioName", "frequency"] as const;
</script>

<svelte:head><title>Position · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  Position
</h1>

<Schemes>
  <DescriptionList>
    <div>
      <dt>Controllers</dt>
      <dd class="space-y-3">
        <Position callsign="IND_83_CTR" />
        <Position callsign="LEX_E_APP" />
        <Position callsign="IND_GND" />
      </dd>
    </div>
    <div>
      <dt>Relief login</dt>
      <dd><Position callsign="IND_831_CTR" /></dd>
    </div>
    <div>
      <dt>Sector leads</dt>
      <dd><Position callsign="IND_83_CTR" show={["shortName", "name"]} /></dd>
    </div>
    <div>
      <dt>Inline</dt>
      <dd><Position callsign="IND_83_CTR" layout="inline" /></dd>
    </div>
    <div>
      <dt>Pilots</dt>
      <dd class="space-y-3">
        <Position
          callsign="LEX_TWR"
          show={pilots}
          airportAt="right"
          airport="KLEX"
        />
        <Position
          callsign="LEX_E_APP"
          show={pilots}
          airportAt="right"
          airport="KLEX"
        />
        <Position callsign="IND_83_CTR" show={pilots} airportAt="right" />
      </dd>
    </div>
    <div>
      <dt>Airport left</dt>
      <dd class="space-y-3">
        <Position
          callsign="LEX_TWR"
          show={pilots}
          airportAt="left"
          airport="KLEX"
        />
        <Position callsign="IND_83_CTR" show={pilots} airportAt="left" />
      </dd>
    </div>
    <div>
      <dt>Airport under</dt>
      <dd>
        <Position
          callsign="LEX_TWR"
          show={pilots}
          airportAt="under"
          airport="KLEX"
          airportName="Blue Grass"
        />
      </dd>
    </div>
    <div>
      <dt>Unknown</dt>
      <dd><Position callsign="IND_X_CTR" /></dd>
    </div>
  </DescriptionList>
</Schemes>
