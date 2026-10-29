<script lang="ts">
  import { Spinner } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<p class="mb-4">
  Turn on "reduce motion" in the device's settings and the spinners hold still.
</p>

<Schemes>
  <ul class="space-y-3">
    <li class="flex items-center gap-2">
      <Spinner /> Loading the roster…
    </li>
    <li class="flex items-center gap-2 text-2xl text-foreground">
      <Spinner label="Saving" /> Larger text
    </li>
    <li class="flex items-center gap-2 text-link">
      <Spinner label="Signing in" /> In the link role
    </li>
  </ul>
</Schemes>
