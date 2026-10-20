<script lang="ts">
  // PROTOTYPE: what's in the cookies and the (fake) profile right now.
  import { prefs } from "./prefs.svelte.ts";
</script>

<dl
  class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-lg border border-border bg-card p-3 text-sm"
  data-testid="readout"
>
  <dt class="font-semibold text-foreground">indy-time-zone</dt>
  <dd class="font-mono break-all">{prefs.zone ?? "none (Zulu)"}</dd>
  <dt class="font-semibold text-foreground">indy-color-scheme</dt>
  <dd class="font-mono">
    {prefs.scheme === "device" ? "none (device)" : prefs.scheme}
  </dd>
  <dt class="font-semibold text-foreground">Profile (fake)</dt>
  <dd class="font-mono break-all">{prefs.profileZone ?? "no zone saved"}</dd>
</dl>
