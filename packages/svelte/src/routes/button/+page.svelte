<script lang="ts">
  import { Button } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";

  let saving = $state(false);
  let showOffline = $state(false);

  function save() {
    saving = true;
    setTimeout(() => (saving = false), 2000);
  }
</script>

<Schemes>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-2">
      <Button>Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger">Delete event</Button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="sm" variant="secondary" aria-label="Add">+</Button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button busy={saving} busyLabel="Saving" onclick={save}>
        Save changes
      </Button>
      <Button
        variant="secondary"
        pressed={showOffline}
        onclick={() => (showOffline = !showOffline)}
      >
        Show offline
      </Button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button href="/button">A link</Button>
      <Button disabled>Disabled</Button>
    </div>
  </div>
</Schemes>
