<script lang="ts" module>
  /** What Tooltip hands its trigger, to spread on it: `<Button {...trigger}>`. */
  export type TooltipTrigger = {
    "aria-describedby": string;
  };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLAttributes } from "svelte/elements";
  import { dismiss } from "../dismiss/dismiss.js";

  type Props = Omit<
    HTMLAttributes<HTMLSpanElement>,
    "children" | "role" | "popover"
  > & {
    /** The tooltip's words: a short description of the trigger. */
    text: string;
    /** The trigger, given the attributes to spread on it. It must take focus. */
    children: Snippet<[TooltipTrigger]>;
  };

  let { text, children, id, class: className, ...rest }: Props = $props();

  const madeId = $props.id();
  const tooltipId = $derived(id ?? madeId);
  // Ties the tooltip to its trigger for CSS anchor positioning.
  const anchor = `--tooltip-${madeId}`;

  const trigger: TooltipTrigger = $derived({ "aria-describedby": tooltipId });

  let hovered = $state(false);
  let focused = $state(false);
  // Escape (or a press elsewhere) hides it until the next hover or focus.
  let dismissed = $state(false);
  const open = $derived((hovered || focused) && !dismissed);

  let box = $state<HTMLSpanElement>();
  let tip = $state<HTMLSpanElement>();

  // A manual popover: drawn above everything, so a table or a scrolling
  // box can't clip it, and it doesn't close a menu it sits in.
  $effect(() => {
    if (!tip) return;
    if (open && !tip.matches(":popover-open")) tip.showPopover();
    if (!open && tip.matches(":popover-open")) tip.hidePopover();
  });

  // Leaving waits a moment, so the pointer can cross the gap onto the
  // tooltip to read it (WCAG 1.4.13); the tooltip is inside the box.
  let leaving: ReturnType<typeof setTimeout> | undefined;
  $effect(() => () => clearTimeout(leaving));

  // A tap isn't a hover: on a phone it would flash the tooltip and go.
  function onpointerenter(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    clearTimeout(leaving);
    dismissed = false;
    hovered = true;
  }

  function onpointerleave(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    clearTimeout(leaving);
    leaving = setTimeout(() => (hovered = false), 100);
  }

  // Only focus a keyboard gives, so a click doesn't leave it showing once
  // the pointer has gone.
  function onfocusin(event: FocusEvent) {
    if (!(event.target as Element).matches(":focus-visible")) return;
    dismissed = false;
    focused = true;
  }

  function onfocusout(event: FocusEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && box?.contains(next)) return;
    focused = false;
  }
</script>

<!-- The box takes hover and focus for the trigger inside it. -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span
  bind:this={box}
  {onpointerenter}
  {onpointerleave}
  {onfocusin}
  {onfocusout}
  style:anchor-name={anchor}
  class={["inline-flex", className]}
>
  {@render children(trigger)}
  <span
    {...rest}
    id={tooltipId}
    role="tooltip"
    popover="manual"
    bind:this={tip}
    use:dismiss={{ open, trigger: box, onclose: () => (dismissed = true) }}
    style:position-anchor={anchor}
    class="tooltip m-0 my-1 max-w-xs rounded-md border-0 bg-foreground px-2 py-1 text-sm text-background shadow-lg"
  >
    {text}
  </span>
</span>

<style>
  /* Above the trigger, centred on it, but kept inside the window; below
     when there's no room above. Tailwind has no utilities for these yet. */
  .tooltip {
    inset: auto;
    position-area: top;
    position-try-fallbacks: flip-block;
  }
</style>
