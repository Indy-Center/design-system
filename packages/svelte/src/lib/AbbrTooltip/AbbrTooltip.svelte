<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import Tooltip from "../Tooltip/Tooltip.svelte";

  // A code in an <abbr> with its long name: read by screen readers from
  // visually hidden text, shown in a Tooltip on hover, and on keyboard
  // focus when focusable. Rating's and Credential's chips and Airport's
  // tooltip mode share it, so they can't drift apart.
  type Props = Omit<HTMLAttributes<HTMLElement>, "children"> & {
    /** The short code the abbr shows: `"C1"`, `"S-GC"`, `"KIND"`. */
    code: string;
    /** Its long name, read after the code and shown in the tooltip. */
    name: string;
    /** Whether the abbr is a tab stop, so a keyboard can show the tooltip. */
    focusable?: boolean;
    /** Draws something round the abbr, such as a chip, given the abbr and the focus ring to put on it (none unless focusable); the caller puts its attributes on that. Without it, the abbr shows the code in mono, takes the ring and the attributes itself. */
    frame?: Snippet<[abbr: Snippet, ring: string | undefined]>;
  };

  // class is for layout, so it goes on the Tooltip box round everything.
  let {
    code,
    name,
    focusable = false,
    frame,
    class: className,
    ...rest
  }: Props = $props();

  // The focus lands on the abbr, but inside a frame the ring goes round
  // the frame.
  const frameRing = $derived(
    focusable
      ? "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ring"
      : undefined,
  );
</script>

<!-- When focusable, a keyboard can show the tooltip too. No title: some
     screen readers would say the long name twice. -->
{#snippet abbr()}
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <abbr
    {...frame ? {} : rest}
    tabindex={focusable ? 0 : undefined}
    class={frame
      ? "no-underline outline-none"
      : [
          "font-mono no-underline",
          focusable &&
            "rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        ]}>{code}<span class="sr-only">{" "}{name}</span></abbr
  >
{/snippet}

<!-- The hidden text reads the long name, so the tooltip is hidden from
     screen readers and the trigger's aria-describedby left off: each would
     say it again. -->
<Tooltip text={name} aria-hidden="true" class={className}>
  {#snippet children()}
    {#if frame}{@render frame(abbr, frameRing)}{:else}{@render abbr()}{/if}
  {/snippet}
</Tooltip>
