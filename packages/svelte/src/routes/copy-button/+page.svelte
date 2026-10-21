<script lang="ts">
  import { CopyButton } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>CopyButton · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  CopyButton
</h1>

<Schemes>
  <dl class="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2">
    <dt class="text-foreground-soft">Frequency</dt>
    <dd class="flex items-center gap-2">
      <span class="font-mono text-foreground">134.000</span>
      <CopyButton text="134.000" label="frequency" />
    </dd>
    <dt class="text-foreground-soft">CID</dt>
    <dd class="flex items-center gap-2">
      <span class="font-mono text-foreground">1234567</span>
      <CopyButton text="1234567" label="CID" />
    </dd>
    <dt class="text-foreground-soft">Callsign</dt>
    <dd class="flex items-center gap-2">
      <span class="font-mono text-foreground">IND_CTR</span>
      <CopyButton text="IND_CTR" label="callsign" />
    </dd>
  </dl>
</Schemes>
