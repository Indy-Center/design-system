<script lang="ts">
  import { Chip } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>Chip · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">Chip</h1>

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
    </ul>
    <p class="flex flex-wrap items-center gap-2 rounded-md bg-card p-3 text-sm">
      Jordan Sample <Chip variant="initials">JS</Chip>
      <Chip>C1</Chip>
      <Chip variant="training">INS</Chip>
    </p>
  </div>
</Schemes>
