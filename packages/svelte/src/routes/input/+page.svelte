<script lang="ts">
  import { Input } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <div class="space-y-3">
    <Input aria-label="Name" placeholder="Jane Doe" />
    <Input type="search" aria-label="Search the roster" placeholder="Search" />
    <Input type="url" aria-label="Website" value="https://flyindycenter.com" />
    <Input type="number" aria-label="Hours" value={12} min={0} />
    <Input type="date" aria-label="Date" value="2026-10-20" />
    <Input type="time" aria-label="Time" value="18:30" />
    <Input type="datetime-local" aria-label="Start" value="2026-10-20T18:30" />
    <Input aria-label="Invalid" aria-invalid={true} value="Not a callsign" />
    <Input aria-label="Disabled" disabled value="Can't change this" />
  </div>
</Schemes>
