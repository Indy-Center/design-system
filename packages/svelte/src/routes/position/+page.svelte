<script lang="ts">
  import { DescriptionList, Position, setPositions } from "../../lib/index.ts";
  import { samplePositions } from "../../playground/positions.ts";
  import Schemes from "../../playground/Schemes.svelte";

  // An app's layout sets them from the CMS catalogue's positions.
  setPositions(() => samplePositions);

  const pilots = ["airport", "radioName", "frequency"] as const;
  const klex = { code: "KLEX", name: "Blue Grass" };
</script>

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
      <dt>No short name</dt>
      <dd><Position callsign="ZID_TMU" /></dd>
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
          airport={klex}
        />
        <Position
          callsign="LEX_E_APP"
          show={pilots}
          airportAt="right"
          airport={klex}
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
          airport={klex}
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
          airport={klex}
        />
      </dd>
    </div>
    <div>
      <dt>Unknown</dt>
      <dd class="space-y-3">
        <Position callsign="IND_X_CTR" />
        <!-- Retired: vNAS no longer lists it. -->
        <Position callsign="PKB_TWR" />
      </dd>
    </div>
  </DescriptionList>
</Schemes>
