<script lang="ts">
  import { CopyButton, DescriptionList } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <DescriptionList>
    <div>
      <dt>Frequency</dt>
      <dd class="flex items-center gap-2">
        <span class="font-mono">134.000</span>
        <CopyButton text="134.000" label="frequency" />
      </dd>
    </div>
    <div>
      <dt>CID</dt>
      <dd class="flex items-center gap-2">
        <span class="font-mono">1234567</span>
        <CopyButton text="1234567" label="CID" />
      </dd>
    </div>
    <div>
      <dt>Callsign</dt>
      <dd class="flex items-center gap-2">
        <span class="font-mono">ZID_CTR</span>
        <CopyButton text="ZID_CTR" label="callsign" />
      </dd>
    </div>
  </DescriptionList>
</Schemes>
