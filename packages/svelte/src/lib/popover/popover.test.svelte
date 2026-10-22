<!-- A button and the panel it shows, for popover.test.ts. The button
     toggles `open`; the panel is placed against the button. -->
<script lang="ts">
  import { popover } from "./popover.js";

  type Props = {
    /** Whether the panel starts open. */
    open?: boolean;
    /** Where the panel goes, as CSS `position-area`. */
    area?: string;
    /** Where else it may go, as CSS `position-try-fallbacks`. */
    fallbacks?: string;
    /** Puts the button at the window's top, with no room above it. */
    atTop?: boolean;
    /** A `style` spread on the button and the panel, as a caller's can be. */
    style?: string;
  };

  let {
    open = false,
    area = "bottom",
    fallbacks,
    atTop = false,
    style,
  }: Props = $props();
  let anchor = $state<HTMLButtonElement>();
</script>

<div class={atTop ? "fixed top-0 left-24" : "p-24"}>
  <button
    {...{ style }}
    bind:this={anchor}
    type="button"
    aria-expanded={open}
    aria-controls="panel"
    onclick={() => (open = !open)}>Apps</button
  >
</div>
<div
  {...{ style }}
  id="panel"
  popover="manual"
  use:popover={{ open, anchor, area, fallbacks }}
  class="m-0 w-40 p-2"
>
  Some text
</div>
