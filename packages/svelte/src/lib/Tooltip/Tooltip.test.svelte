<!-- A Tooltip for Tooltip.test.ts: an icon Button described by its
     tooltip, and a button elsewhere on the page. -->
<script lang="ts">
  import { mdiContentCopy } from "@mdi/js";
  import Button from "../Button/Button.svelte";
  import Icon from "../Icon/Icon.svelte";
  import Tooltip from "./Tooltip.svelte";

  type Props = {
    /** The tooltip's words. */
    text?: string;
    /** Tooltip's class, for the box round the trigger. */
    class?: string;
    /** Passed through to the tooltip, as any other attribute would be. */
    lang?: string;
    /** Puts the trigger at the window's top, with no room above it. */
    top?: boolean;
  };

  let {
    text = "Copies the CID to the clipboard",
    class: className,
    lang,
    top = false,
  }: Props = $props();
</script>

<div
  class={["flex items-start gap-4 pl-40", top ? "fixed top-0 left-0" : "pt-20"]}
>
  <Tooltip {text} class={className} {lang}>
    {#snippet children(trigger)}
      <Button {...trigger} variant="secondary" aria-label="Copy">
        <Icon path={mdiContentCopy} size={20} />
      </Button>
    {/snippet}
  </Tooltip>
  <button type="button">Elsewhere</button>
</div>
