<!-- A Tooltip for Tooltip.test.ts: an icon button described by its
     tooltip, and a button elsewhere on the page. -->
<script lang="ts">
  import Tooltip from "./Tooltip.svelte";

  type Props = {
    /** The tooltip's words. */
    text?: string;
    /** Tooltip's class, for the box round the trigger. */
    class?: string;
    /** Passed through to the tooltip, as any other attribute would be. */
    lang?: string;
  };

  let {
    text = "Copies the CID to the clipboard",
    class: className,
    lang,
  }: Props = $props();
</script>

<div class="flex items-start gap-4 pt-20 pl-40">
  <Tooltip {text} class={className} {lang}>
    {#snippet children(trigger)}
      <button type="button" class="size-11" aria-label="Copy" {...trigger}
        >C</button
      >
    {/snippet}
  </Tooltip>
  <button type="button">Elsewhere</button>
</div>
