<!-- The note by a preference control, saying what its cookie keeps, behind
     a "What's saved?" button (the cookie rules ask for it by the control). -->
<script lang="ts">
  import { mdiInformationOutline } from "@mdi/js";
  import Icon from "../Icon/Icon.svelte";

  type Props = {
    /** What is saved, and where, in a sentence. */
    note: string;
  };

  let { note }: Props = $props();
  let open = $state(false);
  const id = $props.id();
</script>

<div class="px-3">
  <button
    type="button"
    aria-expanded={open}
    aria-controls={id}
    onclick={() => (open = !open)}
    class={[
      "inline-flex min-h-11 min-w-11 cursor-pointer items-center gap-1 rounded-md text-xs text-muted-foreground hover:text-foreground",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    ]}
  >
    <Icon path={mdiInformationOutline} size={16} />
    What's saved?
  </button>
  <p {id} hidden={!open} class="pb-2 text-xs text-muted-foreground">
    {note}
  </p>
</div>
