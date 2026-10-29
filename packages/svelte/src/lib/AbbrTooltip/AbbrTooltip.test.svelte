<!-- An AbbrTooltip in a table cell, for AbbrTooltip.test.ts: a cell takes
     its name from its content, so the test can read what a screen reader
     says. With `framed`, it draws a frame round the abbr, as Rating's and
     Credential's chips do. -->
<script lang="ts">
  import type { ComponentProps } from "svelte";
  import AbbrTooltip from "./AbbrTooltip.svelte";

  let {
    framed = false,
    ...props
  }: Omit<ComponentProps<typeof AbbrTooltip>, "frame"> & {
    framed?: boolean;
  } = $props();
</script>

<table>
  <tbody>
    <tr>
      <td>
        {#if framed}
          <AbbrTooltip {...props}>
            {#snippet frame(abbr, ring)}
              <span data-testid="frame" class={ring}>{@render abbr()}</span>
            {/snippet}
          </AbbrTooltip>
        {:else}
          <AbbrTooltip {...props} />
        {/if}
      </td>
    </tr>
  </tbody>
</table>
