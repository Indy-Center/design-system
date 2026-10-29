<script lang="ts">
  import { mdiContentCopy } from "@mdi/js";
  import { Button, Icon, Tooltip } from "../../lib/index.ts";
  import Schemes from "../../playground/Schemes.svelte";
</script>

<Schemes>
  <div class="flex flex-wrap items-center gap-6 pt-10">
    <Tooltip text="Copies the CID to the clipboard">
      {#snippet children(trigger)}
        <Button {...trigger} variant="secondary" aria-label="Copy CID">
          <Icon path={mdiContentCopy} size={20} />
        </Button>
      {/snippet}
    </Tooltip>
    <p>
      Departing
      <Tooltip text="Indianapolis International">
        {#snippet children(trigger)}
          <!-- Focusable, so a keyboard can show its tooltip. -->
          <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
          <abbr {...trigger} tabindex="0" class="font-mono no-underline"
            >KIND</abbr
          >
        {/snippet}
      </Tooltip>
      at 1800Z.
    </p>
  </div>
</Schemes>
