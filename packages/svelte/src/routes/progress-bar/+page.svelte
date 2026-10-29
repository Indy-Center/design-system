<script lang="ts">
  import { ProgressBar } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <div class="space-y-5">
    <ProgressBar label="Course progress" value={40} />
    <ProgressBar label="Lessons" value={3} max={8} valueText="3 of 8 lessons" />
    <ProgressBar label="Not started" value={0} />
    <ProgressBar label="Finished" value={100} />
  </div>
</Schemes>
