<script lang="ts">
  import { ProgressBar } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<svelte:head><title>ProgressBar · Centerline playground</title></svelte:head>

<h1 class="mb-4 font-heading text-3xl font-semibold text-foreground">
  ProgressBar
</h1>

<Schemes>
  <div class="space-y-5">
    <ProgressBar label="Course progress" value={40} />
    <ProgressBar label="Lessons" value={3} max={8} valueText="3 of 8 lessons" />
    <ProgressBar label="Not started" value={0} />
    <ProgressBar label="Finished" value={100} />
  </div>
</Schemes>
