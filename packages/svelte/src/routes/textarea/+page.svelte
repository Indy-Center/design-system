<script lang="ts">
  import { Textarea } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <div class="space-y-3">
    <Textarea aria-label="Comments" rows={3} placeholder="What went well?" />
    <Textarea aria-label="Invalid" aria-invalid={true} rows={2} />
  </div>
</Schemes>
