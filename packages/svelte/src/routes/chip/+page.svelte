<script lang="ts">
  import { Chip } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <div class="space-y-4">
    <ul class="flex flex-wrap items-center gap-2">
      <li><Chip>S3</Chip></li>
      <li>
        <Chip variant="initials"
          >HY<span class="sr-only"> (operating initials)</span></Chip
        >
      </li>
      <li><Chip variant="senior">ATM</Chip></li>
      <li><Chip variant="training">TA</Chip></li>
      <li><Chip variant="team">WEB</Chip></li>
      <li><Chip variant="certification">IND_APP</Chip></li>
      <li><Chip variant="endorsement">S-LC</Chip></li>
      <li><Chip variant="solo">APP-SOLO</Chip></li>
    </ul>
    <p class="flex flex-wrap items-center gap-2 rounded-md bg-card p-3 text-sm">
      Jordan Sample <Chip variant="initials">JS</Chip>
      <Chip>C1</Chip>
      <Chip variant="training">INS</Chip>
    </p>
  </div>
</Schemes>
